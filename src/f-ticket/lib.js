const fs = require("fs");
const path = require("path");

const TICKETS_DIR_NAME = "_TICKETS";
const PLAN_DIR_NAME = "_PLAN";
const DOCS_DIR_NAME = "_DOCS";

const TICKET_FRONT_MATTER_ORDER = [
  "id",
  "title",
  "type",
  "parent",
  "status",
  "priority",
  "owner",
  "labels",
  "depends_on",
  "created",
  "updated",
];

function repoRoot() {
  return process.cwd();
}

function ticketsDir() {
  return path.join(repoRoot(), TICKETS_DIR_NAME);
}

function planDir() {
  return path.join(repoRoot(), PLAN_DIR_NAME);
}

function docsDir() {
  return path.join(repoRoot(), DOCS_DIR_NAME);
}

function templatesDir() {
  return path.join(__dirname, "templates");
}

function ticketTemplatePath() {
  return path.join(templatesDir(), "ticket.md");
}

function requirementTemplatePath() {
  return path.join(__dirname, "..", "f-planner", "templates", "requirement.md");
}

function planTemplatePath() {
  return path.join(__dirname, "..", "f-planner", "templates", "plan.md");
}

function documentationTemplatePath() {
  return path.join(__dirname, "..", "f-planner", "templates", "documentation.md");
}

function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(title) {
  let slug = String(title || "").toLowerCase();
  slug = slug.replace(/[^a-z0-9]+/g, "-");
  slug = slug.replace(/-+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "untitled";
}

function parseArgs(argv) {
  const positional = [];
  const flags = {
    status: undefined,
    priority: undefined,
    owner: undefined,
    labels: undefined,
    label: undefined,
    addLabel: [],
    removeLabel: [],
    log: undefined,
    check: undefined,
    type: undefined,
    parent: undefined,
    dependsOn: undefined,
    modules: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--") && arg.includes("=")) {
      throw new Error(`Invalid flag syntax: ${arg}`);
    }

    if (arg === "--status") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --status");
      flags.status = value;
      i += 1;
      continue;
    }
    if (arg === "--priority") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --priority");
      flags.priority = value;
      i += 1;
      continue;
    }
    if (arg === "--owner") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --owner");
      flags.owner = value;
      i += 1;
      continue;
    }
    if (arg === "--labels") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --labels");
      flags.labels = value;
      i += 1;
      continue;
    }
    if (arg === "--label") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --label");
      flags.label = value;
      i += 1;
      continue;
    }
    if (arg === "--add-label") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --add-label");
      flags.addLabel.push(value);
      i += 1;
      continue;
    }
    if (arg === "--remove-label") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --remove-label");
      flags.removeLabel.push(value);
      i += 1;
      continue;
    }
    if (arg === "--log") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --log");
      flags.log = value;
      i += 1;
      continue;
    }
    if (arg === "--check") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --check");
      flags.check = value;
      i += 1;
      continue;
    }
    if (arg === "--type") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --type");
      flags.type = value;
      i += 1;
      continue;
    }
    if (arg === "--parent") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --parent");
      flags.parent = value;
      i += 1;
      continue;
    }
    if (arg === "--depends-on") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --depends-on");
      flags.dependsOn = value;
      i += 1;
      continue;
    }
    if (arg === "--modules") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error("Missing value for --modules");
      flags.modules = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("--")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
    positional.push(arg);
  }

  return { positional, flags };
}

function requireTicketsDir() {
  let stat;
  try {
    stat = fs.statSync(ticketsDir());
  } catch (_err) {
    throw new Error(`${TICKETS_DIR_NAME}/ not found. Run \`f-ticket init\` first.`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`${TICKETS_DIR_NAME}/ not found. Run \`f-ticket init\` first.`);
  }
}

function requirePlanDir() {
  let stat;
  try {
    stat = fs.statSync(planDir());
  } catch (_err) {
    throw new Error(`${PLAN_DIR_NAME}/ not found. Run \`f-ticket init\` with planning enabled first.`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`${PLAN_DIR_NAME}/ not found. Run \`f-ticket init\` with planning enabled first.`);
  }
}

function requireDocsDir() {
  let stat;
  try {
    stat = fs.statSync(docsDir());
  } catch (_err) {
    throw new Error(`${DOCS_DIR_NAME}/ not found. Run \`f-ticket init\` with planning enabled first.`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`${DOCS_DIR_NAME}/ not found. Run \`f-ticket init\` with planning enabled first.`);
  }
}

function listTicketFiles() {
  requireTicketsDir();
  const entries = fs.readdirSync(ticketsDir());
  const files = entries.filter((entry) => /^[0-9]{4}-.*\.md$/.test(entry));
  return files.map((entry) => path.join(ticketsDir(), entry)).sort();
}

function findTicketFileById(id) {
  if (!/^[0-9]{4}$/.test(id)) {
    throw new Error(`Invalid ticket id: ${id}`);
  }
  requireTicketsDir();
  const entries = fs.readdirSync(ticketsDir());
  const matches = entries.filter((entry) => new RegExp(`^${id}-.*\\.md$`).test(entry));
  if (matches.length === 0) {
    throw new Error(`Ticket ${id} not found`);
  }
  if (matches.length > 1) {
    throw new Error(`Multiple tickets found for ${id}: ${matches.join(", ")}`);
  }
  return path.join(ticketsDir(), matches[0]);
}

function splitFrontMatter(content) {
  const eol = content.includes("\r\n") ? "\r\n" : "\n";
  const lines = content.split(/\r?\n/);

  let firstNonEmpty = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() !== "") {
      firstNonEmpty = i;
      break;
    }
  }
  if (firstNonEmpty === -1 || lines[firstNonEmpty].trim() !== "---") {
    throw new Error("Invalid front matter: first non-empty line must be ---");
  }

  let end = -1;
  for (let i = firstNonEmpty + 1; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    throw new Error("Invalid front matter: closing --- not found");
  }

  return {
    frontMatterRaw: lines.slice(firstNonEmpty + 1, end).join(eol),
    bodyRaw: lines.slice(end + 1).join(eol),
    eol,
  };
}

function unquote(value) {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineList(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  const inner = trimmed.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((item) => unquote(item).trim())
    .filter((item) => item.length > 0);
}

function parseListField(lines, startIndex) {
  const collected = [];
  let index = startIndex + 1;
  while (index < lines.length) {
    const match = lines[index].match(/^\s*-\s*(.+)\s*$/);
    if (!match) break;
    const item = unquote(match[1]).trim();
    if (item.length > 0) {
      collected.push(item);
    }
    index += 1;
  }
  return { values: collected, nextIndex: index - 1 };
}

function parseFrontMatter(frontMatterRaw) {
  const lines = frontMatterRaw.split(/\r?\n/);
  const data = {
    id: undefined,
    title: undefined,
    type: undefined,
    parent: undefined,
    status: undefined,
    priority: undefined,
    owner: undefined,
    labels: [],
    depends_on: [],
    created: undefined,
    updated: undefined,
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const rawValue = match[2];

    if (key === "labels" || key === "depends_on") {
      const inline = parseInlineList(rawValue);
      if (inline !== null) {
        data[key] = inline;
        continue;
      }
      if (rawValue.trim() === "") {
        const parsed = parseListField(lines, i);
        data[key] = parsed.values;
        i = parsed.nextIndex;
      }
      continue;
    }

    data[key] = unquote(rawValue);
  }

  data.labels = Array.isArray(data.labels) ? data.labels : [];
  data.depends_on = Array.isArray(data.depends_on) ? data.depends_on : [];
  data.type = String(data.type || "").trim().toLowerCase() || undefined;
  data.parent = normalizeNullableScalar(data.parent);
  return data;
}

function normalizeNullableScalar(value) {
  const text = String(value || "").trim();
  return text.length > 0 ? text : "";
}

function formatYamlScalar(value) {
  const text = String(value || "");
  if (text.length === 0) return "";
  if (/^[A-Za-z0-9._/@:+-]+$/.test(text)) return text;
  return JSON.stringify(text);
}

function formatInlineList(values) {
  const items = Array.isArray(values) ? values : [];
  if (items.length === 0) return "[]";
  return `[${items.map((item) => formatYamlScalar(item)).join(", ")}]`;
}

function serializeFrontMatter(frontMatter) {
  const source = { ...(frontMatter || {}) };
  const lines = [];
  const known = new Set(TICKET_FRONT_MATTER_ORDER);

  for (const key of TICKET_FRONT_MATTER_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
    if (key === "labels" || key === "depends_on") {
      lines.push(`${key}: ${formatInlineList(source[key] || [])}`);
      continue;
    }
    lines.push(`${key}: ${formatYamlScalar(source[key])}`);
  }

  for (const [key, value] of Object.entries(source)) {
    if (known.has(key)) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: ${formatInlineList(value)}`);
      continue;
    }
    lines.push(`${key}: ${formatYamlScalar(value)}`);
  }

  return lines.join("\n");
}

function readTicketRecordById(id) {
  const filePath = findTicketFileById(id);
  const content = fs.readFileSync(filePath, "utf8");
  const { frontMatterRaw, bodyRaw, eol } = splitFrontMatter(content);
  return {
    filePath,
    fileName: path.basename(filePath),
    content,
    frontMatterRaw,
    bodyRaw,
    eol,
    frontMatter: parseFrontMatter(frontMatterRaw),
  };
}

function listTicketRecords() {
  return listTicketFiles().map((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    const { frontMatterRaw, bodyRaw, eol } = splitFrontMatter(content);
    return {
      filePath,
      fileName: path.basename(filePath),
      content,
      frontMatterRaw,
      bodyRaw,
      eol,
      frontMatter: parseFrontMatter(frontMatterRaw),
    };
  });
}

function writeFileAtomic(targetPath, newContent) {
  const dir = path.dirname(targetPath);
  const base = path.basename(targetPath);
  const tmpPath = path.join(dir, `.${base}.tmp-${process.pid}-${Date.now()}`);

  let mode;
  try {
    const stat = fs.statSync(targetPath);
    if (stat.isFile()) {
      mode = stat.mode & 0o777;
    }
  } catch (_err) {
    // target may not exist
  }

  try {
    fs.writeFileSync(tmpPath, newContent, {
      encoding: "utf8",
      flag: "wx",
      mode,
    });
    fs.renameSync(tmpPath, targetPath);
    if (mode !== undefined) {
      fs.chmodSync(targetPath, mode);
    }
  } catch (err) {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch (_cleanupErr) {
      // ignore cleanup errors
    }
    throw new Error(`Unable to write file: ${err.message}`);
  }
}

function validateStatus(status) {
  if (!["open", "doing", "blocked", "done", "wontfix"].includes(status)) {
    throw new Error(
      `Invalid status: ${status}. Use open, doing, blocked, done, or wontfix.`
    );
  }
}

function validatePriority(priority) {
  if (!["p0", "p1", "p2", "p3"].includes(priority)) {
    throw new Error(`Invalid priority: ${priority}. Use p0, p1, p2, or p3.`);
  }
}

function validateTicketType(type) {
  if (!["workstream", "job"].includes(type)) {
    throw new Error(`Invalid type: ${type}. Use workstream or job.`);
  }
}

function validateModulesSelection(modules) {
  if (!["tickets", "planning", "both"].includes(modules)) {
    throw new Error(`Invalid modules selection: ${modules}. Use tickets, planning, or both.`);
  }
}

function parseCsvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeDependsOnInput(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text || text === "none" || text === "null" || text === "-") return [];
  return parseCsvList(value);
}

function normalizeParentInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const lowered = text.toLowerCase();
  if (lowered === "none" || lowered === "null" || lowered === "-") return "";
  return text;
}

function validateTicketRelationships(type, parent, dependsOn, selfId = "") {
  validateTicketType(type);
  const records = listTicketRecords();
  const byId = new Map();
  for (const record of records) {
    const id = String(record.frontMatter.id || record.fileName.slice(0, 4)).trim();
    if (id) {
      byId.set(id, record);
    }
  }

  if (type === "workstream" && parent) {
    throw new Error("WORKSTREAM tickets cannot specify parent.");
  }

  if (parent) {
    if (!/^\d{4}$/.test(parent)) {
      throw new Error("Invalid parent id. Must be exactly 4 digits.");
    }
    const parentRecord = byId.get(parent);
    if (!parentRecord) {
      throw new Error(`Parent ticket not found: ${parent}`);
    }
    const parentType = String(parentRecord.frontMatter.type || "").toLowerCase();
    if (parentType !== "workstream") {
      throw new Error(`Parent ${parent} must be a WORKSTREAM.`);
    }
  }

  for (const depId of dependsOn || []) {
    if (!/^\d{4}$/.test(depId)) {
      throw new Error(`Invalid depends_on id: ${depId}. Must be exactly 4 digits.`);
    }
    if (selfId && depId === selfId) {
      throw new Error("depends_on cannot include the ticket itself.");
    }
    if (!byId.has(depId)) {
      throw new Error(`Dependency ticket not found: ${depId}`);
    }
  }
}

function appendLog(bodyRaw, message) {
  const eol = bodyRaw.includes("\r\n") ? "\r\n" : "\n";
  const lines = bodyRaw.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim() === "## Log");
  if (headerIndex === -1) {
    throw new Error("Log section not found: ## Log");
  }
  let end = lines.length;
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  lines.splice(end, 0, `- ${todayISO()}: ${message}`);
  return lines.join(eol);
}

function checkAcceptance(bodyRaw, needle) {
  const eol = bodyRaw.includes("\r\n") ? "\r\n" : "\n";
  const lines = bodyRaw.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim() === "## Acceptance criteria");
  if (headerIndex === -1) {
    throw new Error("Acceptance criteria section not found: ## Acceptance criteria");
  }
  let end = lines.length;
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }

  const needleLower = String(needle || "").toLowerCase();
  const matches = [];
  for (let i = headerIndex + 1; i < end; i += 1) {
    const match = lines[i].match(/^(\s*-\s*)\[( |x|X)\](\s*)(.*)$/);
    if (!match) continue;
    if (match[4].toLowerCase().includes(needleLower)) {
      matches.push({
        index: i,
        checked: match[2].toLowerCase() === "x",
        prefix: match[1],
        spacing: match[3],
        text: match[4],
        line: lines[i],
      });
    }
  }

  if (matches.length === 0) {
    throw new Error("No matching acceptance criteria found.");
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple matching acceptance criteria: ${matches.map((item) => item.line.trim()).join(" | ")}`
    );
  }
  if (matches[0].checked) {
    throw new Error("Acceptance criteria already checked.");
  }
  lines[matches[0].index] = `${matches[0].prefix}[x]${matches[0].spacing}${matches[0].text}`;
  return lines.join(eol);
}

function renderTemplate(templatePath, replacements) {
  let template;
  try {
    template = fs.readFileSync(templatePath, "utf8");
  } catch (err) {
    throw new Error(`Unable to read template: ${err.message}`);
  }

  let content = template;
  for (const [key, value] of Object.entries(replacements || {})) {
    content = content.split(`{{${key}}}`).join(String(value));
  }
  return content;
}

function ensureReadableFile(filePath, label) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`${label} not found at ${filePath}`);
    }
    throw new Error(`Unable to read ${label}: ${err.message}`);
  }
}

function nextTicketId() {
  const records = listTicketFiles();
  let maxId = 0;
  for (const filePath of records) {
    const match = path.basename(filePath).match(/^(\d{4})-/);
    if (!match) continue;
    const parsed = Number.parseInt(match[1], 10);
    if (Number.isFinite(parsed) && parsed > maxId) {
      maxId = parsed;
    }
  }
  return String(maxId + 1).padStart(4, "0");
}

function featureDirName(name) {
  return slugify(name);
}

function requirementFileName(name) {
  const slug = slugify(name);
  return `010_${slug}.REQ.md`;
}

function planFileName(name) {
  const slug = slugify(name);
  return `020_${slug}.PLAN.md`;
}

function documentationFileName(name) {
  const slug = slugify(name);
  return `${slug}.DOC.md`;
}

module.exports = {
  DOCS_DIR_NAME,
  PLAN_DIR_NAME,
  TICKETS_DIR_NAME,
  appendLog,
  checkAcceptance,
  docsDir,
  documentationFileName,
  documentationTemplatePath,
  ensureReadableFile,
  featureDirName,
  findTicketFileById,
  listTicketFiles,
  listTicketRecords,
  nextTicketId,
  normalizeDependsOnInput,
  normalizeParentInput,
  parseArgs,
  parseCsvList,
  parseFrontMatter,
  planDir,
  planFileName,
  planTemplatePath,
  readTicketRecordById,
  renderTemplate,
  repoRoot,
  requirementFileName,
  requirementTemplatePath,
  requireDocsDir,
  requirePlanDir,
  requireTicketsDir,
  serializeFrontMatter,
  slugify,
  splitFrontMatter,
  ticketTemplatePath,
  ticketsDir,
  todayISO,
  validateModulesSelection,
  validatePriority,
  validateStatus,
  validateTicketRelationships,
  validateTicketType,
  writeFileAtomic,
};
