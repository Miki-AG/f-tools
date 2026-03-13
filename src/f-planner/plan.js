const fs = require("fs");
const path = require("path");
const {
  ensureReadableFile,
  featureDirName,
  planDir,
  planFileName,
  planTemplatePath,
  renderTemplate,
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
    fail('Usage: f-planner plan "Feature name"', 2);
  }

  try {
    requirePlanDir();
    ensureReadableFile(planTemplatePath(), "Plan template");
  } catch (err) {
    fail(err.message);
  }

  const slug = slugify(name);
  const featureDir = path.join(planDir(), featureDirName(name));
  const filePath = path.join(featureDir, planFileName(name));

  try {
    fs.mkdirSync(featureDir, { recursive: true });
  } catch (err) {
    fail(`Unable to create feature directory: ${err.message}`);
  }
  if (fs.existsSync(filePath)) {
    fail(`Plan doc already exists: ${path.relative(process.cwd(), filePath)}`);
  }

  const content = renderTemplate(planTemplatePath(), {
    name,
    slug,
    date: todayISO(),
  });
  try {
    fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "wx" });
  } catch (err) {
    fail(`Unable to write plan doc: ${err.message}`);
  }

  process.stdout.write(`${path.relative(process.cwd(), filePath)}\n`);
}

main();
