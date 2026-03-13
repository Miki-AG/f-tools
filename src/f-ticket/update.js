const path = require("path");
const {
  appendLog,
  checkAcceptance,
  normalizeDependsOnInput,
  normalizeParentInput,
  parseArgs,
  readTicketRecordById,
  requireTicketsDir,
  serializeFrontMatter,
  todayISO,
  validatePriority,
  validateStatus,
  validateTicketRelationships,
  validateTicketType,
  writeFileAtomic,
} = require("./lib");

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function ensureAllowedFlags(flags) {
  const unsupported = [];
  if (flags.labels !== undefined) unsupported.push("--labels");
  if (flags.label !== undefined) unsupported.push("--label");
  if (flags.modules !== undefined) unsupported.push("--modules");
  if (unsupported.length > 0) {
    fail(`Unknown flag: ${unsupported[0]}`);
  }
}

function labelsDiff(beforeLabels, afterLabels) {
  const removed = beforeLabels.filter((label) => !afterLabels.includes(label));
  const added = afterLabels.filter((label) => !beforeLabels.includes(label));
  return { removed, added };
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (positional.length === 0) {
    fail("Missing id. Usage: f-ticket update <id> [options]", 2);
  }
  if (positional.length > 1) {
    fail(`Unexpected argument: ${positional[1]}`);
  }

  const id = positional[0];
  if (!/^\d{4}$/.test(id)) {
    fail("Invalid id. Must be exactly 4 digits.");
  }

  ensureAllowedFlags(flags);

  const status = flags.status !== undefined ? String(flags.status).trim().toLowerCase() : null;
  const priority = flags.priority !== undefined ? String(flags.priority).trim().toLowerCase() : null;
  const owner = flags.owner !== undefined ? String(flags.owner).trim() : null;
  const type = flags.type !== undefined ? String(flags.type).trim().toLowerCase() : null;
  const parent = flags.parent !== undefined ? normalizeParentInput(flags.parent) : null;
  const dependsOn = flags.dependsOn !== undefined ? normalizeDependsOnInput(flags.dependsOn) : null;
  const addLabels = flags.addLabel || [];
  const removeLabels = flags.removeLabel || [];
  const logMessage = flags.log !== undefined ? flags.log : null;
  const checkNeedle = flags.check !== undefined ? flags.check : null;

  try {
    if (status !== null) validateStatus(status);
    if (priority !== null) validatePriority(priority);
    if (type !== null) validateTicketType(type);
  } catch (err) {
    fail(err.message);
  }

  if (
    status === null &&
    priority === null &&
    owner === null &&
    type === null &&
    parent === null &&
    dependsOn === null &&
    addLabels.length === 0 &&
    removeLabels.length === 0 &&
    logMessage === null &&
    checkNeedle === null
  ) {
    fail("No changes requested.");
  }

  try {
    requireTicketsDir();
  } catch (err) {
    fail(err.message);
  }

  let record;
  try {
    record = readTicketRecordById(id);
  } catch (err) {
    fail(err.message);
  }

  const frontMatter = { ...record.frontMatter };
  const changes = [];
  let updatedBody = record.bodyRaw;

  if (status !== null && frontMatter.status !== status) {
    changes.push(`status: ${frontMatter.status || ""} -> ${status}`);
    frontMatter.status = status;
  }
  if (priority !== null && frontMatter.priority !== priority) {
    changes.push(`priority: ${frontMatter.priority || ""} -> ${priority}`);
    frontMatter.priority = priority;
  }
  if (owner !== null && frontMatter.owner !== owner) {
    changes.push(`owner: ${frontMatter.owner || ""} -> ${owner}`);
    frontMatter.owner = owner;
  }

  const nextType = type !== null ? type : String(frontMatter.type || "job").trim().toLowerCase();
  const nextParent = parent !== null ? parent : String(frontMatter.parent || "").trim();
  const nextDependsOn = dependsOn !== null ? dependsOn : [...(frontMatter.depends_on || [])];

  if (type !== null && frontMatter.type !== type) {
    changes.push(`type: ${frontMatter.type || ""} -> ${type}`);
  }
  if (parent !== null && String(frontMatter.parent || "") !== parent) {
    changes.push(`parent: ${frontMatter.parent || ""} -> ${parent}`);
  }
  if (dependsOn !== null) {
    const before = Array.isArray(frontMatter.depends_on) ? frontMatter.depends_on : [];
    if (JSON.stringify(before) !== JSON.stringify(dependsOn)) {
      changes.push(
        `depends_on: ${before.length > 0 ? before.join(",") : "[]"} -> ${dependsOn.length > 0 ? dependsOn.join(",") : "[]"}`
      );
    }
  }

  frontMatter.type = nextType;
  frontMatter.parent = nextParent;
  frontMatter.depends_on = nextDependsOn;

  try {
    validateTicketRelationships(frontMatter.type, frontMatter.parent, frontMatter.depends_on, id);
  } catch (err) {
    fail(err.message);
  }

  if (addLabels.length > 0 || removeLabels.length > 0) {
    const before = Array.isArray(frontMatter.labels) ? [...frontMatter.labels] : [];
    const after = [...before];
    for (const label of removeLabels) {
      const idx = after.indexOf(label);
      if (idx === -1) {
        fail(`Label not found: ${label}`);
      }
      after.splice(idx, 1);
    }
    for (const label of addLabels) {
      if (!after.includes(label)) after.push(label);
    }
    frontMatter.labels = after;
    const diff = labelsDiff(before, after);
    for (const label of diff.removed) {
      changes.push(`labels: -${label}`);
    }
    for (const label of diff.added) {
      changes.push(`labels: +${label}`);
    }
  }

  if (logMessage !== null) {
    try {
      updatedBody = appendLog(updatedBody, logMessage);
      changes.push("log: appended");
    } catch (err) {
      fail(err.message);
    }
  }

  if (checkNeedle !== null) {
    try {
      updatedBody = checkAcceptance(updatedBody, checkNeedle);
      changes.push(`acceptance: checked "${checkNeedle}"`);
    } catch (err) {
      fail(err.message);
    }
  }

  if (changes.length === 0) {
    fail("No changes applied.");
  }

  frontMatter.updated = todayISO();
  changes.unshift(`updated: ${frontMatter.updated}`);

  const newContent = `---${record.eol}${serializeFrontMatter(frontMatter)}${record.eol}---${
    updatedBody.length > 0 ? `${record.eol}${updatedBody}` : ""
  }`;

  try {
    writeFileAtomic(record.filePath, newContent);
  } catch (err) {
    fail(err.message);
  }

  process.stdout.write(`_TICKETS/${path.basename(record.filePath)}\n`);
  for (const line of changes) {
    process.stdout.write(`${line}\n`);
  }
}

main();
