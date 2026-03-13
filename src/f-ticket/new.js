const fs = require("fs");
const path = require("path");
const {
  ensureReadableFile,
  listTicketFiles,
  nextTicketId,
  normalizeDependsOnInput,
  normalizeParentInput,
  parseArgs,
  parseCsvList,
  renderTemplate,
  requireTicketsDir,
  serializeFrontMatter,
  slugify,
  splitFrontMatter,
  ticketTemplatePath,
  ticketsDir,
  todayISO,
  validatePriority,
  validateTicketRelationships,
  validateTicketType,
} = require("./lib");

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function usageAndExit() {
  process.stderr.write(
    'Usage: f-ticket new "Ticket title" [--type workstream|job] [--priority p0|p1|p2|p3] [--owner name] [--labels a,b,c] [--parent 0001] [--depends-on 0002,0003]\n'
  );
  process.exit(2);
}

function ensureAllowedFlags(flags) {
  const unsupported = [];
  if (flags.status !== undefined) unsupported.push("--status");
  if (flags.label !== undefined) unsupported.push("--label");
  if (flags.addLabel.length > 0) unsupported.push("--add-label");
  if (flags.removeLabel.length > 0) unsupported.push("--remove-label");
  if (flags.log !== undefined) unsupported.push("--log");
  if (flags.check !== undefined) unsupported.push("--check");
  if (flags.modules !== undefined) unsupported.push("--modules");
  if (unsupported.length > 0) {
    fail(`Unknown flag: ${unsupported[0]}`);
  }
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (positional.length === 0) {
    usageAndExit();
  }
  if (positional.length > 1) {
    fail(`Unexpected argument: ${positional[1]}`);
  }
  ensureAllowedFlags(flags);

  const title = positional[0];
  if (!String(title || "").trim()) {
    fail("Ticket title cannot be empty.");
  }

  const type = String(flags.type || "job").trim().toLowerCase();
  const priority = String(flags.priority || "p2").trim().toLowerCase();
  const owner = String(flags.owner || "").trim();
  const labels = parseCsvList(flags.labels);
  const parent = normalizeParentInput(flags.parent);
  const dependsOn = normalizeDependsOnInput(flags.dependsOn);

  try {
    validateTicketType(type);
    validatePriority(priority);
    requireTicketsDir();
    validateTicketRelationships(type, parent, dependsOn, "");
  } catch (err) {
    fail(err.message);
  }

  const templatePath = ticketTemplatePath();
  try {
    ensureReadableFile(templatePath, "Template");
  } catch (err) {
    fail(err.message);
  }

  try {
    listTicketFiles();
  } catch (err) {
    fail(err.message);
  }

  const id = nextTicketId();
  const slug = slugify(title);
  const targetPath = path.join(ticketsDir(), `${id}-${slug}.md`);
  if (fs.existsSync(targetPath)) {
    fail(`Ticket already exists: _TICKETS/${id}-${slug}.md`);
  }

  const today = todayISO();
  let content;
  try {
    content = renderTemplate(templatePath, {
      id,
      title,
      type,
      parent,
      labels: labels.length > 0 ? `[${labels.join(", ")}]` : "[]",
      depends_on: dependsOn.length > 0 ? `[${dependsOn.join(", ")}]` : "[]",
      date: today,
    });
  } catch (err) {
    fail(err.message);
  }

  let frontMatterRaw;
  let bodyRaw;
  try {
    ({ frontMatterRaw, bodyRaw } = splitFrontMatter(content));
  } catch (err) {
    fail(err.message);
  }

  const frontMatter = require("./lib").parseFrontMatter(frontMatterRaw);
  frontMatter.priority = priority;
  frontMatter.owner = owner;
  frontMatter.labels = labels;
  frontMatter.type = type;
  frontMatter.parent = parent;
  frontMatter.depends_on = dependsOn;

  const newContent = `---\n${serializeFrontMatter(frontMatter)}\n---\n${bodyRaw.length > 0 ? `\n${bodyRaw}` : ""}`;

  try {
    fs.writeFileSync(targetPath, newContent, { encoding: "utf8", flag: "wx" });
  } catch (err) {
    fail(`Unable to write ticket file: ${err.message}`);
  }

  process.stdout.write(`_TICKETS/${id}-${slug}.md\n`);
}

main();
