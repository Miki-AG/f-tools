const fs = require("fs");
const path = require("path");
const {
  docsDir,
  documentationFileName,
  documentationTemplatePath,
  ensureReadableFile,
  renderTemplate,
  requireDocsDir,
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
    fail('Usage: f-planner doc "Document name"', 2);
  }

  try {
    requireDocsDir();
    ensureReadableFile(documentationTemplatePath(), "Documentation template");
  } catch (err) {
    fail(err.message);
  }

  const slug = slugify(name);
  const filePath = path.join(docsDir(), documentationFileName(name));
  if (fs.existsSync(filePath)) {
    fail(`Documentation doc already exists: ${path.relative(process.cwd(), filePath)}`);
  }

  const content = renderTemplate(documentationTemplatePath(), {
    name,
    slug,
    date: todayISO(),
  });
  try {
    fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "wx" });
  } catch (err) {
    fail(`Unable to write documentation doc: ${err.message}`);
  }

  process.stdout.write(`${path.relative(process.cwd(), filePath)}\n`);
}

main();
