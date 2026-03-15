const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const TICKET_BIN = path.join(REPO_ROOT, "f-ticket");
const PLANNER_BIN = path.join(REPO_ROOT, "f-planner");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTool(binPath, cwd, args, options = {}) {
  const result = spawnSync(binPath, args, {
    cwd,
    encoding: "utf8",
    input: options.input || undefined,
  });

  if (result.error) {
    throw new Error(`Failed to execute ${path.basename(binPath)}: ${result.error.message}`);
  }

  return {
    command: `${binPath} ${args.join(" ")}`.trim(),
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

function makeTempRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "f-ticket-cli-"));
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function expectExists(filePath, message) {
  assert(fs.existsSync(filePath), message);
}

function runScenario(name, fn) {
  try {
    fn();
    process.stdout.write(`Scenario: ${name}\nResult: pass\n\n`);
    return true;
  } catch (err) {
    process.stdout.write(`Scenario: ${name}\nResult: fail\nError: ${err.message}\n\n`);
    return false;
  }
}

function testInitAutomationTickets() {
  const repo = makeTempRepo();
  const result = runTool(TICKET_BIN, repo, ["init", "--modules", "tickets"]);
  printResult("001-init-automation-tickets", result);
  assert(result.exitCode === 0, "f-ticket init --modules tickets must exit 0.");
  expectExists(path.join(repo, "AGENTS.md"), "AGENTS.md must exist.");
  expectExists(path.join(repo, "GEMINI.md"), "GEMINI.md must exist.");
  expectExists(path.join(repo, "_TICKETS", "README.md"), "_TICKETS/README.md must exist.");
  assert(read(path.join(repo, "AGENTS.md")).includes("_TICKETS/"), "Ticket-only AGENTS.md must mention _TICKETS/.");
  assert(read(path.join(repo, "GEMINI.md")).includes("AGENTS.md"), "GEMINI.md must redirect to AGENTS.md.");
  expectExists(path.join(repo, "_TICKETS", ".gitignore"), "_TICKETS/.gitignore must exist for ticket init.");
  const gitignore = read(path.join(repo, "_TICKETS", ".gitignore"));
  assert(gitignore.includes("config.json"), "_TICKETS/.gitignore must ignore config.json.");
  assert(gitignore.includes("status.json"), "_TICKETS/.gitignore must ignore status.json.");
  assert(!fs.existsSync(path.join(repo, ".gitignore")), "Root .gitignore must not be created by ticket init.");
  assert(!fs.existsSync(path.join(repo, "_PLAN")), "_PLAN must not exist for ticket-only init.");
  assert(!fs.existsSync(path.join(repo, "_DOCS")), "_DOCS must not exist for ticket-only init.");
}

function testInitAutomationPlanning() {
  const repo = makeTempRepo();
  const result = runTool(TICKET_BIN, repo, ["init", "--modules", "planning"]);
  printResult("002-init-automation-planning", result);
  assert(result.exitCode === 0, "f-ticket init --modules planning must exit 0.");
  expectExists(path.join(repo, "AGENTS.md"), "AGENTS.md must exist.");
  expectExists(path.join(repo, "GEMINI.md"), "GEMINI.md must exist.");
  expectExists(path.join(repo, "_PLAN", "README.md"), "_PLAN/README.md must exist.");
  expectExists(path.join(repo, "_PLAN", "010_PRD.md"), "_PLAN/010_PRD.md must exist.");
  expectExists(path.join(repo, "_DOCS", "README.md"), "_DOCS/README.md must exist.");
  assert(read(path.join(repo, "AGENTS.md")).includes("_PLAN/"), "Planning-only AGENTS.md must mention _PLAN/.");
  assert(read(path.join(repo, "AGENTS.md")).includes("_DOCS/"), "Planning-only AGENTS.md must mention _DOCS/.");
  assert(!fs.existsSync(path.join(repo, ".gitignore")), "Root .gitignore must not be created for planning-only init.");
  assert(!fs.existsSync(path.join(repo, "_TICKETS", ".gitignore")), "_TICKETS/.gitignore must not be created for planning-only init.");
  assert(!fs.existsSync(path.join(repo, "_TICKETS")), "_TICKETS must not exist for planning-only init.");
}

function testInitInteractiveBoth() {
  const repo = makeTempRepo();
  const result = runTool(TICKET_BIN, repo, ["init"], { input: "3\n" });
  printResult("003-init-interactive-both", result);
  assert(result.exitCode === 0, "Interactive f-ticket init must exit 0.");
  expectExists(path.join(repo, "AGENTS.md"), "AGENTS.md must exist.");
  expectExists(path.join(repo, "GEMINI.md"), "GEMINI.md must exist.");
  expectExists(path.join(repo, "_TICKETS", "README.md"), "_TICKETS/README.md must exist.");
  expectExists(path.join(repo, "_PLAN", "README.md"), "_PLAN/README.md must exist.");
  expectExists(path.join(repo, "_DOCS", "README.md"), "_DOCS/README.md must exist.");
  expectExists(path.join(repo, "_PLAN", "010_PRD.md"), "_PLAN/010_PRD.md must exist.");
  expectExists(path.join(repo, "_TICKETS", ".gitignore"), "_TICKETS/.gitignore must exist for both-mode init.");
  assert(!fs.existsSync(path.join(repo, ".gitignore")), "Root .gitignore must not be created for both-mode init.");
  assert(read(path.join(repo, "AGENTS.md")).includes("_PLAN/"), "Both-mode AGENTS.md must mention _PLAN/.");
  assert(read(path.join(repo, "AGENTS.md")).includes("_TICKETS/"), "Both-mode AGENTS.md must mention _TICKETS/.");
  assert(read(path.join(repo, "AGENTS.md")).includes("_DOCS/"), "Both-mode AGENTS.md must mention _DOCS/.");
}

function testTicketHierarchyAndGenerators() {
  const repo = makeTempRepo();

  let result = runTool(TICKET_BIN, repo, ["init", "--modules", "both"]);
  printResult("004-init-both", result);
  assert(result.exitCode === 0, "f-ticket init --modules both must exit 0.");

  result = runTool(TICKET_BIN, repo, ["new", "Storage migration", "--type", "workstream", "--priority", "p1", "--labels", "platform"]);
  printResult("005-new-workstream", result);
  assert(result.exitCode === 0, "Creating workstream must succeed.");
  assert(result.stdout.includes("_TICKETS/0001-storage-migration.md"), "First ticket path must be printed.");

  result = runTool(TICKET_BIN, repo, [
    "new",
    "Patch CLI paths",
    "--type",
    "job",
    "--parent",
    "0001",
    "--depends-on",
    "0001",
    "--priority",
    "p1",
    "--owner",
    "codex",
    "--labels",
    "cli,workflow",
  ]);
  printResult("006-new-job", result);
  assert(result.exitCode === 0, "Creating child job must succeed.");

  const workstreamFile = path.join(repo, "_TICKETS", "0001-storage-migration.md");
  const jobFile = path.join(repo, "_TICKETS", "0002-patch-cli-paths.md");
  const workstreamText = read(workstreamFile);
  const jobText = read(jobFile);
  assert(workstreamText.includes("type: workstream"), "Workstream ticket must store type.");
  assert(jobText.includes("type: job"), "Job ticket must store type.");
  assert(jobText.includes("parent: 0001"), "Job ticket must store parent.");
  assert(jobText.includes("depends_on: [0001]"), "Job ticket must store depends_on.");

  result = runTool(TICKET_BIN, repo, ["update", "0002", "--status", "doing", "--add-label", "active"]);
  printResult("007-update-job", result);
  assert(result.exitCode === 0, "Updating job must succeed.");
  assert(read(jobFile).includes("status: doing"), "Updated job must store new status.");
  assert(read(jobFile).includes("active"), "Updated job must store added label.");

  result = runTool(TICKET_BIN, repo, ["list"]);
  printResult("008-list", result);
  assert(result.exitCode === 0, "f-ticket list must succeed.");
  assert(result.stdout.startsWith("id\ttype\tparent\tstatus"), "List output must include new header columns.");
  assert(result.stdout.includes("0002\tjob\t0001\tdoing"), "List output must include job hierarchy fields.");

  result = runTool(PLANNER_BIN, repo, ["req", "Update Workflow"]);
  printResult("009-req", result);
  assert(result.exitCode === 0, "f-planner req must succeed.");
  expectExists(
    path.join(repo, "_PLAN", "update-workflow", "010_update-workflow.REQ.md"),
    "Requirement doc must be created."
  );

  result = runTool(PLANNER_BIN, repo, ["plan", "Update Workflow"]);
  printResult("010-plan", result);
  assert(result.exitCode === 0, "f-planner plan must succeed.");
  expectExists(
    path.join(repo, "_PLAN", "update-workflow", "020_update-workflow.PLAN.md"),
    "Plan doc must be created."
  );

  result = runTool(PLANNER_BIN, repo, ["doc", "Workflow Guide"]);
  printResult("011-doc", result);
  assert(result.exitCode === 0, "f-planner doc must succeed.");
  expectExists(path.join(repo, "_DOCS", "workflow-guide.DOC.md"), "Documentation doc must be created.");
}

function testInvalidParentValidation() {
  const repo = makeTempRepo();
  let result = runTool(TICKET_BIN, repo, ["init", "--modules", "tickets"]);
  printResult("012-init-validation-repo", result);
  assert(result.exitCode === 0, "Init for validation repo must succeed.");

  result = runTool(TICKET_BIN, repo, ["new", "Bad child", "--type", "job", "--parent", "9999"]);
  printResult("013-invalid-parent", result);
  assert(result.exitCode !== 0, "Creating job with missing parent must fail.");
  assert(result.stderr.includes("Parent ticket not found: 9999"), "Validation error must mention missing parent.");
}

function testPlannerPrdGenerator() {
  const repo = makeTempRepo();
  fs.mkdirSync(path.join(repo, "_PLAN"), { recursive: true });

  const result = runTool(PLANNER_BIN, repo, ["prd"]);
  printResult("014-prd", result);
  assert(result.exitCode === 0, "f-planner prd must succeed.");
  expectExists(path.join(repo, "_PLAN", "010_PRD.md"), "PRD doc must be created.");
  assert(
    read(path.join(repo, "_PLAN", "010_PRD.md")).includes("# Product Requirements Document"),
    "PRD doc must include the template header."
  );
}

function testPlannerHelpDescribesFeatures() {
  const repo = makeTempRepo();

  const result = runTool(PLANNER_BIN, repo, ["-h"]);
  printResult("015-planner-help", result);
  assert(result.exitCode === 0, "f-planner -h must succeed.");
  assert(
    result.stdout.includes('req and plan slug the feature name into ./_PLAN/<feature-slug>/.'),
    "Planner help must explain feature folders."
  );
  assert(
    result.stdout.includes('Example: "Update Workflow" -> ./_PLAN/update-workflow/'),
    "Planner help must include a feature folder example."
  );
  assert(
    result.stdout.includes("010_<feature-slug>.REQ.md"),
    "Planner help must mention requirement file naming."
  );
  assert(
    result.stdout.includes("020_<feature-slug>.PLAN.md"),
    "Planner help must mention plan file naming."
  );
}

function testInitPreservesExistingRootGuides() {
  const repo = makeTempRepo();
  const customAgents = "# Custom Agent Guide\n";
  const customGemini = "# Custom Gemini Guide\n";
  fs.writeFileSync(path.join(repo, "AGENTS.md"), customAgents, "utf8");
  fs.writeFileSync(path.join(repo, "GEMINI.md"), customGemini, "utf8");

  const result = runTool(TICKET_BIN, repo, ["init", "--modules", "tickets"]);
  printResult("015-init-preserve-root-guides", result);
  assert(result.exitCode === 0, "Init with existing root guides must still succeed.");
  assert(read(path.join(repo, "AGENTS.md")) === customAgents, "Existing AGENTS.md must not be overwritten.");
  assert(read(path.join(repo, "GEMINI.md")) === customGemini, "Existing GEMINI.md must not be overwritten.");
}

function testInitUpdatesExistingGitignore() {
  const repo = makeTempRepo();
  fs.mkdirSync(path.join(repo, "_TICKETS"), { recursive: true });
  const customGitignore = "notes.txt\nstatus.json\n";
  fs.writeFileSync(path.join(repo, "_TICKETS", ".gitignore"), customGitignore, "utf8");

  const result = runTool(TICKET_BIN, repo, ["init", "--modules", "tickets"]);
  printResult("016-init-updates-gitignore", result);
  assert(result.exitCode === 0, "Init with existing _TICKETS/.gitignore must still succeed.");

  const gitignore = read(path.join(repo, "_TICKETS", ".gitignore"));
  assert(gitignore.includes("notes.txt"), "Existing _TICKETS/.gitignore content must be preserved.");
  assert(gitignore.includes("config.json"), "_TICKETS/.gitignore must add config.json.");
  assert(gitignore.includes("status.json"), "_TICKETS/.gitignore must keep status.json.");
  assert(
    gitignore.split("status.json").length - 1 === 1,
    "_TICKETS/.gitignore must not duplicate existing status.json rule."
  );
  assert(!fs.existsSync(path.join(repo, ".gitignore")), "Root .gitignore must not be created.");
}

function main() {
  if (!fs.existsSync(TICKET_BIN)) {
    fail(`Missing root wrapper: ${TICKET_BIN}`);
  }
  if (!fs.existsSync(PLANNER_BIN)) {
    fail(`Missing root wrapper: ${PLANNER_BIN}`);
  }

  const scenarios = [
    ["001-init-automation-tickets", testInitAutomationTickets],
    ["002-init-automation-planning", testInitAutomationPlanning],
    ["003-init-interactive-both", testInitInteractiveBoth],
    ["004-ticket-hierarchy-and-generators", testTicketHierarchyAndGenerators],
    ["005-invalid-parent-validation", testInvalidParentValidation],
    ["006-planner-prd-generator", testPlannerPrdGenerator],
    ["007-planner-help-describes-features", testPlannerHelpDescribesFeatures],
    ["008-init-preserves-existing-root-guides", testInitPreservesExistingRootGuides],
    ["009-init-updates-existing-gitignore", testInitUpdatesExistingGitignore],
  ];

  let passed = 0;
  let failed = 0;

  for (const [name, fn] of scenarios) {
    if (runScenario(name, fn)) passed += 1;
    else failed += 1;
  }

  process.stdout.write(`Total scenarios: ${scenarios.length}\n`);
  process.stdout.write(`Total passed: ${passed}\n`);
  process.stdout.write(`Total failed: ${failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
