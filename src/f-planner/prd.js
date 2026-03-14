const fs = require("fs");
const path = require("path");
const {
  ensureReadableFile,
  planDir,
  prdTemplatePath,
  renderTemplate,
  requirePlanDir,
  todayISO,
} = require("./lib");

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function main() {
  if (process.argv[2] !== undefined) {
    fail("Usage: f-planner prd", 2);
  }

  try {
    requirePlanDir();
    ensureReadableFile(prdTemplatePath(), "PRD template");
  } catch (err) {
    fail(err.message);
  }

  const filePath = path.join(planDir(), "010_PRD.md");
  if (fs.existsSync(filePath)) {
    fail(`PRD already exists: ${path.relative(process.cwd(), filePath)}`);
  }

  const content = renderTemplate(prdTemplatePath(), {
    date: todayISO(),
  });

  try {
    fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "wx" });
  } catch (err) {
    fail(`Unable to write PRD doc: ${err.message}`);
  }

  process.stdout.write(`${path.relative(process.cwd(), filePath)}\n`);
}

main();
