const fs = require("fs");
const path = require("path");
const {
  ensureReadableFile,
  featureDirName,
  planDir,
  renderTemplate,
  requirementFileName,
  requirementTemplatePath,
  requirePlanDir,
  slugify,
  todayISO,
} = require("./lib");

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function main() {
  const name = String(process.argv[2] || "").trim();
  if (!name) {
    fail('Usage: f-planner req "Feature name"', 2);
  }

  try {
    requirePlanDir();
    ensureReadableFile(requirementTemplatePath(), "Requirement template");
  } catch (err) {
    fail(err.message);
  }

  const slug = slugify(name);
  const featureDir = path.join(planDir(), featureDirName(name));
  const filePath = path.join(featureDir, requirementFileName(name));

  try {
    fs.mkdirSync(featureDir, { recursive: true });
  } catch (err) {
    fail(`Unable to create feature directory: ${err.message}`);
  }
  if (fs.existsSync(filePath)) {
    fail(`Requirement doc already exists: ${path.relative(process.cwd(), filePath)}`);
  }

  const content = renderTemplate(requirementTemplatePath(), {
    name,
    slug,
    date: todayISO(),
  });
  try {
    fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "wx" });
  } catch (err) {
    fail(`Unable to write requirement doc: ${err.message}`);
  }

  process.stdout.write(`${path.relative(process.cwd(), filePath)}\n`);
}

main();
