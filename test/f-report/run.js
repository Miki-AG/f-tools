"use strict";

const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const REPORT_BIN = path.join(REPO_ROOT, "f-report");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runCommand(cwd, args, extraEnv = {}) {
  const result = spawnSync(REPORT_BIN, args, {
    cwd,
    encoding: "utf8",
    timeout: 30000,
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.error) {
    throw new Error(`Command failed to execute: ${result.error.message}`);
  }

  return {
    command: `${REPORT_BIN} ${args.join(" ")}`.trim(),
    exitCode: result.status === null ? 1 : result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function printResult(name, result) {
  process.stdout.write(`Scenario: ${name}\n`);
  process.stdout.write(`Command: ${result.command}\n`);
  process.stdout.write(`Exit: ${result.exitCode}\n`);
  process.stdout.write("Stdout:\n");
  process.stdout.write(result.stdout.trim().length ? result.stdout : "<empty>\n");
  process.stdout.write("Stderr:\n");
  process.stdout.write(result.stderr.trim().length ? result.stderr : "<empty>\n");
  process.stdout.write("\n");
}

function ensureRepoArtifacts() {
  if (!fs.existsSync(REPORT_BIN)) {
    fail(`Missing root wrapper: ${REPORT_BIN}`);
  }
  const sourceEntry = path.join(REPO_ROOT, "src", "f-report", "f-report");
  if (!fs.existsSync(sourceEntry)) {
    fail(`Missing source entrypoint: ${sourceEntry}`);
  }
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address && typeof address === "object" ? address.port : null;
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        if (!Number.isFinite(port)) {
          reject(new Error("Unable to determine free port."));
          return;
        }
        resolve(port);
      });
    });
  });
}

function extractUrl(stdout) {
  const match = String(stdout || "").match(/URL:\s*(http:\/\/[^\s]+)/i);
  return match ? match[1] : null;
}

function createRepoWithSampleTickets(repoDir, title) {
  const ticketsDir = path.join(repoDir, "_TICKETS");
  fs.mkdirSync(ticketsDir, { recursive: true });
  const workstreamPath = path.join(ticketsDir, "0001-sample-workstream.md");
  const jobPath = path.join(ticketsDir, "0002-sample-job.md");

  fs.writeFileSync(
    workstreamPath,
    `---\nid: 0001\ntitle: ${title} workstream\ntype: workstream\nparent: \nstatus: open\npriority: p1\nowner: test\nlabels: [WORKSTREAM]\ndepends_on: []\ncreated: 2026-03-05\nupdated: 2026-03-05\n---\n\n## Context\nSample context\n\n## Acceptance criteria\n- [ ] Sample\n\n## Notes\nSample\n\n## Log\n- 2026-03-05: created\n`,
    "utf8"
  );
  fs.writeFileSync(
    jobPath,
    `---\nid: 0002\ntitle: ${title} job\ntype: job\nparent: 0001\nstatus: open\npriority: p1\nowner: test\nlabels: [JOB]\ndepends_on: [0001]\ncreated: 2026-03-05\nupdated: 2026-03-05\n---\n\n## Context\nSample context\n\n## Acceptance criteria\n- [ ] Sample\n\n## Notes\nSample\n\n## Log\n- 2026-03-05: created\n`,
    "utf8"
  );
}

async function fetchJson(url, init) {
  const res = await fetch(url, {
    cache: "no-store",
    ...(init || {}),
  });
  const data = await res.json();
  return { res, data };
}

async function fetchText(url, init) {
  const res = await fetch(url, {
    cache: "no-store",
    ...(init || {}),
  });
  const text = await res.text();
  return { res, text };
}

async function runScenarios() {
  let passed = 0;
  let failed = 0;

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "f-report-multi-"));
  const globalStateDir = path.join(tempRoot, "global-state");
  const repoA = path.join(tempRoot, "repo-a");
  const repoB = path.join(tempRoot, "repo-b");
  fs.mkdirSync(repoA, { recursive: true });
  fs.mkdirSync(repoB, { recursive: true });
  createRepoWithSampleTickets(repoA, "Repo A");
  createRepoWithSampleTickets(repoB, "Repo B");
  const repoAReal = fs.realpathSync(repoA);
  const repoBReal = fs.realpathSync(repoB);

  const port = await getFreePort();
  const env = { F_REPORT_HOME: globalStateDir };

  const helpResult = runCommand(repoA, ["-h"], env);
  printResult("001-help", helpResult);
  try {
    assert(helpResult.exitCode === 0, "Help command must exit 0.");
    assert(
      helpResult.stdout.toLowerCase().includes("single daemon"),
      "Help output should mention single daemon behavior."
    );
    assert(helpResult.stdout.includes("./_TICKETS"), "Help output must mention _TICKETS.");
    passed += 1;
  } catch (err) {
    failed += 1;
    process.stdout.write(`Error: ${err.message}\n\n`);
  }

  let stopResult;
  try {
    const startA = runCommand(
      repoA,
      ["start", "--host", "127.0.0.1", "--port", String(port), "--interval", "500"],
      env
    );
    printResult("002-start-repo-a", startA);
    const startB = runCommand(
      repoB,
      ["start", "--host", "127.0.0.1", "--port", String(port), "--interval", "500"],
      env
    );
    printResult("003-start-repo-b", startB);
    const statusA = runCommand(repoA, ["status"], env);
    printResult("004-status", statusA);

    assert(startA.exitCode === 0, "First start must exit 0.");
    assert(startB.exitCode === 0, "Second start must exit 0.");
    assert(statusA.stdout.includes("attached projects: 2"), "Status should report two attached projects.");

    const baseUrl = extractUrl(startA.stdout);
    assert(baseUrl, "Start output must include URL.");

    const projectsResponse = await fetchJson(`${baseUrl}/api/projects`);
    assert(projectsResponse.res.ok, "GET /api/projects must succeed.");
    const projects = Array.isArray(projectsResponse.data.projects) ? projectsResponse.data.projects : [];
    assert(projects.length === 2, "Expected exactly two attached projects.");

    const projectA = projects.find((project) => project.path === repoAReal);
    const projectB = projects.find((project) => project.path === repoBReal);
    assert(projectA, "Repo A project must be present.");
    assert(projectB, "Repo B project must be present.");

    const reportA = await fetchJson(`${baseUrl}/api/projects/${encodeURIComponent(projectA.id)}/report`);
    assert(reportA.res.ok, "Project report endpoint must succeed.");
    const tickets = Array.isArray(reportA.data.tickets) ? reportA.data.tickets : [];
    assert(tickets.length === 2, "Project report must return two tickets.");
    const workstream = tickets.find((ticket) => ticket.id === "0001");
    const job = tickets.find((ticket) => ticket.id === "0002");
    assert(workstream && workstream.type === "workstream", "Workstream payload must include type.");
    assert(job && job.type === "job", "Job payload must include type.");
    assert(job && job.parent === "0001", "Job payload must include parent.");
    assert(job && Array.isArray(job.dependsOn) && job.dependsOn.includes("0001"), "Job payload must include dependsOn.");

    const ticketA = await fetchJson(`${baseUrl}/api/projects/${encodeURIComponent(projectA.id)}/ticket/0002`);
    assert(ticketA.res.ok, "Ticket endpoint must succeed.");
    assert(ticketA.data.ticket && ticketA.data.ticket.parent === "0001", "Ticket payload must include parent.");

    const landingHtml = await fetchText(`${baseUrl}/`);
    const projectHtml = await fetchText(`${baseUrl}/project/${encodeURIComponent(projectA.id)}`);
    const ticketHtml = await fetchText(`${baseUrl}/project/${encodeURIComponent(projectA.id)}/ticket/0002`);
    assert(landingHtml.res.ok, "Landing page must load.");
    assert(projectHtml.res.ok, "Project page must load.");
    assert(ticketHtml.res.ok, "Ticket page must load.");
    assert(landingHtml.text.includes("id=\"root\""), "Landing page must include React mount root.");
    assert(projectHtml.text.includes("\"mode\":\"project\""), "Project page bootstrap config must set project mode.");
    assert(ticketHtml.text.includes("\"ticketId\":\"0002\""), "Ticket page bootstrap config must set ticket id.");

    const configUpdateA = await fetchJson(
      `${baseUrl}/api/projects/${encodeURIComponent(projectA.id)}/config`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columns: {
            desktop: {
              owner: false,
            },
          },
        }),
      }
    );
    assert(configUpdateA.res.ok, "Project config update endpoint must succeed.");
    assert(
      configUpdateA.data.config &&
        configUpdateA.data.config.columns &&
        configUpdateA.data.config.columns.desktop &&
        configUpdateA.data.config.columns.desktop.type === true,
      "Project config response must expose the type column."
    );

    const repoAConfigPath = path.join(repoA, "_TICKETS", "config.json");
    const repoBConfigPath = path.join(repoB, "_TICKETS", "config.json");
    assert(fs.existsSync(repoAConfigPath), "Repo A config file should be created.");
    assert(!fs.existsSync(repoBConfigPath), "Repo B config file must not be created by Repo A update.");
    const repoAConfig = JSON.parse(fs.readFileSync(repoAConfigPath, "utf8"));
    assert(
      repoAConfig.columns &&
        repoAConfig.columns.desktop &&
        repoAConfig.columns.desktop.type === true,
      "Persisted project config must include the type column."
    );

    const updateRes = await fetchJson(
      `${baseUrl}/api/projects/${encodeURIComponent(projectA.id)}/ticket/0002`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Repo A updated job",
          status: "doing",
          priority: "p1",
          owner: "tester",
          labels: ["JOB"],
          updates: "Updated from multi-repo test",
          body: "Updated body",
        }),
      }
    );
    assert(updateRes.res.ok, "Project-scoped ticket update must succeed.");

    const repoAFile = fs.readFileSync(path.join(repoA, "_TICKETS", "0002-sample-job.md"), "utf8");
    const repoBFile = fs.readFileSync(path.join(repoB, "_TICKETS", "0002-sample-job.md"), "utf8");
    assert(repoAFile.includes("Repo A updated job"), "Repo A ticket file should be updated.");
    assert(repoAFile.includes("type: job"), "Ticket update must preserve type.");
    assert(repoAFile.includes("parent: 0001"), "Ticket update must preserve parent.");
    assert(repoAFile.includes("depends_on: [0001]"), "Ticket update must preserve depends_on.");
    assert(!repoBFile.includes("Repo A updated job"), "Repo B ticket file must remain unchanged.");

    const detachRes = await fetchJson(
      `${baseUrl}/api/projects/${encodeURIComponent(projectB.id)}/detach`,
      {
        method: "POST",
      }
    );
    assert(detachRes.res.ok, "Detach endpoint must succeed.");
    const remaining = Array.isArray(detachRes.data.projects) ? detachRes.data.projects : [];
    assert(remaining.length === 1, "Detach should leave one project.");

    passed += 1;
  } catch (err) {
    failed += 1;
    process.stdout.write(`Error: ${err.message}\n\n`);
  } finally {
    try {
      stopResult = runCommand(repoA, ["stop"], env);
      printResult("005-stop", stopResult);
    } catch (err) {
      process.stdout.write(`Cleanup stop failed: ${err.message}\n\n`);
    }
  }

  process.stdout.write(`Total scenarios: 2\n`);
  process.stdout.write(`Total passed: ${passed}\n`);
  process.stdout.write(`Total failed: ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  ensureRepoArtifacts();
  await runScenarios();
}

main().catch((err) => {
  fail(err.message);
});
