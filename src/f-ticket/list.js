const path = require("path");
const {
  listTicketRecords,
  parseArgs,
  requireTicketsDir,
  validateStatus,
} = require("./lib");

function fail(message, code = 1) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function ensureAllowedFlags(flags) {
  const unsupported = [];
  if (flags.priority !== undefined) unsupported.push("--priority");
  if (flags.labels !== undefined) unsupported.push("--labels");
  if (flags.addLabel.length > 0) unsupported.push("--add-label");
  if (flags.removeLabel.length > 0) unsupported.push("--remove-label");
  if (flags.log !== undefined) unsupported.push("--log");
  if (flags.check !== undefined) unsupported.push("--check");
  if (flags.type !== undefined) unsupported.push("--type");
  if (flags.parent !== undefined) unsupported.push("--parent");
  if (flags.dependsOn !== undefined) unsupported.push("--depends-on");
  if (flags.modules !== undefined) unsupported.push("--modules");
  if (unsupported.length > 0) {
    fail(`Unknown flag: ${unsupported[0]}`);
  }
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  if (positional.length > 0) {
    fail(`Unexpected argument: ${positional[0]}`);
  }
  ensureAllowedFlags(flags);

  if (flags.status !== undefined) {
    try {
      validateStatus(flags.status);
    } catch (err) {
      fail(err.message);
    }
  }

  try {
    requireTicketsDir();
  } catch (err) {
    fail(err.message);
  }

  let records;
  try {
    records = listTicketRecords();
  } catch (err) {
    fail(err.message);
  }

  const rows = [];
  for (const record of records) {
    const fm = record.frontMatter;
    const idNum = Number.parseInt(String(fm.id || ""), 10);
    if (!Number.isFinite(idNum)) continue;
    if (flags.status && fm.status !== flags.status) continue;
    if (flags.owner !== undefined && String(fm.owner || "") !== String(flags.owner || "")) continue;
    if (flags.label) {
      const labels = Array.isArray(fm.labels) ? fm.labels : [];
      if (!labels.includes(flags.label)) continue;
    }

    rows.push({
      id: fm.id || "",
      type: fm.type || "",
      parent: fm.parent || "",
      status: fm.status || "",
      priority: fm.priority || "",
      owner: fm.owner || "",
      dependsOn: Array.isArray(fm.depends_on) ? fm.depends_on.join(",") : "",
      title: fm.title || "",
      file: `_TICKETS/${path.basename(record.filePath)}`,
      idNum,
    });
  }

  rows.sort((a, b) => a.idNum - b.idNum);
  process.stdout.write("id\ttype\tparent\tstatus\tpriority\towner\tdepends_on\ttitle\tfile\n");
  for (const row of rows) {
    process.stdout.write(
      [row.id, row.type, row.parent, row.status, row.priority, row.owner, row.dependsOn, row.title, row.file].join("\t") +
        "\n"
    );
  }
}

main();
