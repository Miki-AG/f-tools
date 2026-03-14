const fs = require("fs");
const path = require("path");
const readline = require("readline");
const {
  DOCS_DIR_NAME,
  PLAN_DIR_NAME,
  TICKETS_DIR_NAME,
  docsDir,
  planDir,
  prdTemplatePath,
  repoRoot,
  renderTemplate,
  ticketsDir,
  todayISO,
  ensureReadableFile,
  validateModulesSelection,
  writeFileAtomic,
} = require("./lib");

const ROOT_AGENTS_FILE = "AGENTS.md";
const ROOT_GEMINI_FILE = "GEMINI.md";

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function usageAndExit() {
  process.stderr.write(
    "Usage: f-ticket init [--modules tickets|planning|both]\n"
  );
  process.exit(2);
}

function parseInitArgs(argv) {
  let modules;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--modules") {
      const value = argv[i + 1];
      if (value === undefined) fail("Missing value for --modules", 2);
      modules = value;
      i += 1;
      continue;
    }
    if (arg === "-h" || arg === "--help") {
      usageAndExit();
    }
    fail(`Unknown flag: ${arg}`, 2);
  }
  if (modules !== undefined) {
    try {
      validateModulesSelection(modules);
    } catch (err) {
      fail(err.message, 2);
    }
  }
  return modules;
}

function dirState(targetPath) {
  if (!fs.existsSync(targetPath)) return { exists: false, isDirectory: true, entries: [] };
  let stat;
  try {
    stat = fs.statSync(targetPath);
  } catch (err) {
    fail(`Unable to stat ${path.basename(targetPath)}: ${err.message}`);
  }
  if (!stat.isDirectory()) {
    return { exists: true, isDirectory: false, entries: [] };
  }
  let entries = [];
  try {
    entries = fs.readdirSync(targetPath).filter((entry) => !entry.startsWith("."));
  } catch (err) {
    fail(`Unable to read ${path.basename(targetPath)}: ${err.message}`);
  }
  return { exists: true, isDirectory: true, entries };
}

function ensureWritableRoot() {
  const root = repoRoot();
  if (!fs.existsSync(root)) {
    fail(`Current directory does not exist: ${root}`);
  }
  let stat;
  try {
    stat = fs.statSync(root);
  } catch (err) {
    fail(`Unable to stat current directory: ${err.message}`);
  }
  if (!stat.isDirectory()) {
    fail(`Current path is not a directory: ${root}`);
  }
  try {
    fs.accessSync(root, fs.constants.W_OK);
  } catch (_err) {
    fail(`Current directory is not writable: ${root}`);
  }
}

function selectedTargets(modules) {
  const targets = [];
  if (modules === "tickets" || modules === "both") {
    targets.push({ name: TICKETS_DIR_NAME, dirPath: ticketsDir() });
  }
  if (modules === "planning" || modules === "both") {
    targets.push({ name: PLAN_DIR_NAME, dirPath: planDir() });
    targets.push({ name: DOCS_DIR_NAME, dirPath: docsDir() });
  }
  return targets;
}

function ensureCleanTargets(modules) {
  for (const target of selectedTargets(modules)) {
    const state = dirState(target.dirPath);
    if (state.exists && !state.isDirectory) {
      fail(`${target.name} exists but is not a directory: ${target.dirPath}`);
    }
    if (state.exists && state.entries.length > 0) {
      fail(`Repo already initialized: ${target.name}/ is not empty`);
    }
  }
}

function folderReadmeContent(folderName) {
  if (folderName === TICKETS_DIR_NAME) {
    return `# ${TICKETS_DIR_NAME}

This folder contains execution tickets only.

- Use WORKSTREAM tickets for major execution tracks.
- Use JOB tickets for concrete implementation work under a WORKSTREAM.
- Keep dependencies and parent links in ticket front matter.
`;
  }
  if (folderName === PLAN_DIR_NAME) {
    return `# ${PLAN_DIR_NAME}

Planning artifacts live here.

- \`010_PRD.md\` is the high-level product document.
- Feature folders contain requirement and plan docs.
- Keep planning artifacts separate from execution tickets.
`;
  }
  return `# ${DOCS_DIR_NAME}

Post-implementation documentation lives here.

- Keep documentation current with the implemented behavior.
- Prefer one focused doc per topic.
`;
}

function rootAgentsContent(modules) {
  if (modules === "tickets") {
    return `# Agent Guide

This repo uses the f-tools ticket workflow.

Use \`${TICKETS_DIR_NAME}/\` for execution tracking.
Create tickets with \`./f-ticket new\`.
Inspect work with \`./f-ticket list\`.
Keep status, labels, acceptance checks, and logs current with \`./f-ticket update\`.

Keep \`${TICKETS_DIR_NAME}/\` as the source of truth for execution state.
`;
  }

  if (modules === "planning") {
    return `# Agent Guide

This repo uses the f-tools planning workflow.

Use \`${PLAN_DIR_NAME}/\` for planning artifacts and \`${DOCS_DIR_NAME}/\` for implemented behavior docs.
Keep \`${PLAN_DIR_NAME}/010_PRD.md\` current for product direction.
Create the top-level PRD with \`./f-planner prd\` if it is missing.
Create requirement and plan docs with \`./f-planner req\` and \`./f-planner plan\`.
Create implementation docs with \`./f-planner doc\`.

Use documentation for implemented behavior, not intended behavior.
`;
  }

  return `# Agent Guide

This repo uses the f-tools planning and ticket workflow.

Use \`${PLAN_DIR_NAME}/\` for planning, \`${TICKETS_DIR_NAME}/\` for execution, and \`${DOCS_DIR_NAME}/\` for implemented behavior docs.

Recommended flow:
1. Create \`${PLAN_DIR_NAME}/010_PRD.md\` with \`./f-planner prd\` if it is missing, then update it when overall product direction changes.
2. Create feature requirement and plan docs with \`./f-planner req\` and \`./f-planner plan\`.
3. Create workstreams and jobs with \`./f-ticket new\`.
4. Keep ticket state current with \`./f-ticket update\`.
5. Write or refresh docs with \`./f-planner doc\` after behavior is implemented.

Do not invent alternate file naming. Use the files created by the tools.
`;
}

function rootGeminiContent() {
  return `# Gemini Guide

- Follow \`AGENTS.md\` for workflow instructions in this repo.
`;
}

function writeRootGuideIfMissing(fileName, content) {
  const filePath = path.join(repoRoot(), fileName);
  if (fs.existsSync(filePath)) {
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (err) {
      fail(`Unable to stat ${fileName}: ${err.message}`);
    }
    if (!stat.isFile()) {
      fail(`${fileName} exists but is not a file: ${filePath}`);
    }
    return;
  }

  try {
    writeFileAtomic(filePath, content);
  } catch (err) {
    fail(`Unable to write ${fileName}: ${err.message}`);
  }
}

function createPlanningArtifacts(modules) {
  for (const target of selectedTargets(modules)) {
    if (!fs.existsSync(target.dirPath)) {
      try {
        fs.mkdirSync(target.dirPath, { recursive: true });
      } catch (err) {
        fail(`Unable to create ${target.name}: ${err.message}`);
      }
    }
    try {
      writeFileAtomic(path.join(target.dirPath, "README.md"), folderReadmeContent(target.name));
    } catch (err) {
      fail(`Unable to write ${target.name}/README.md: ${err.message}`);
    }
  }

  if (modules === "planning" || modules === "both") {
    try {
      ensureReadableFile(prdTemplatePath(), "PRD template");
      writeFileAtomic(
        path.join(planDir(), "010_PRD.md"),
        renderTemplate(prdTemplatePath(), { date: todayISO() })
      );
    } catch (err) {
      fail(`Unable to write ${PLAN_DIR_NAME}/010_PRD.md: ${err.message}`);
    }
  }

  writeRootGuideIfMissing(ROOT_AGENTS_FILE, rootAgentsContent(modules));
  writeRootGuideIfMissing(ROOT_GEMINI_FILE, rootGeminiContent());
}

function promptModules() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    let piped = "";
    try {
      piped = fs.readFileSync(0, "utf8");
    } catch (_err) {
      piped = "";
    }
    const trimmed = String(piped || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) || "";
    if (trimmed === "1") return Promise.resolve("tickets");
    if (trimmed === "2") return Promise.resolve("planning");
    if (trimmed === "3") return Promise.resolve("both");
    fail("Non-interactive init requires --modules tickets|planning|both", 2);
  }

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const prompt = [
      "Select initialization mode:",
      "  1) ticketing only",
      "  2) planning only",
      "  3) both",
      "> ",
    ].join("\n");

    rl.question(prompt, (answer) => {
      rl.close();
      const trimmed = String(answer || "").trim();
      if (trimmed === "1") resolve("tickets");
      else if (trimmed === "2") resolve("planning");
      else if (trimmed === "3") resolve("both");
      else fail(`Invalid selection: ${trimmed || "<empty>"}`, 2);
    });
  });
}

async function main() {
  ensureWritableRoot();
  let modules = parseInitArgs(process.argv.slice(2));
  if (!modules) {
    modules = await promptModules();
  }
  ensureCleanTargets(modules);
  createPlanningArtifacts(modules);
  process.stdout.write(`Initialized f-ticket repo with ${modules} modules\n`);
}

main().catch((err) => {
  fail(err.message);
});
