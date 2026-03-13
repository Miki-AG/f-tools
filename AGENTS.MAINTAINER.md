# Maintainer Guide

This file is for contributors changing `f-tools` itself. It is not a usage guide for agents consuming the tools in another repo.

Start here:

- Product and workflow contract: [README.md](/Users/miguelarmengol/_dev/ocecat/f-tools/README.md)
- Consumer-facing agent guides: [AGENTS.md](/Users/miguelarmengol/_dev/ocecat/f-tools/AGENTS.md)
- Package scripts: [package.json](/Users/miguelarmengol/_dev/ocecat/f-tools/package.json)

Repo shape:

- Root wrappers: [f-planner](/Users/miguelarmengol/_dev/ocecat/f-tools/f-planner), [f-ticket](/Users/miguelarmengol/_dev/ocecat/f-tools/f-ticket), [f-report](/Users/miguelarmengol/_dev/ocecat/f-tools/f-report)
- Planner source: [src/f-planner](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner)
- Ticket source: [src/f-ticket](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket)
- Report source: [src/f-report](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report)
- Tests: [test/f-ticket](/Users/miguelarmengol/_dev/ocecat/f-tools/test/f-ticket), [test/f-report](/Users/miguelarmengol/_dev/ocecat/f-tools/test/f-report)

Important design constraints:

- The root executables are thin wrappers. Most behavior changes belong under `src/`.
- `f-planner` intentionally reuses shared helpers via [src/f-planner/lib.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/lib.js), which re-exports [src/f-ticket/lib.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/lib.js).
- The file formats in `_PLAN/`, `_DOCS/`, and `_TICKETS/` are the product contract. Treat filename conventions, front matter fields, and CLI output as externally visible behavior.
- `f-report` is a single-daemon, multi-repo system. Be careful not to regress project attachment, shared global state, or browser bootstrap behavior.

Where to change things:

- Planner commands and templates:
  [src/f-planner/f-planner](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/f-planner),
  [src/f-planner/req.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/req.js),
  [src/f-planner/plan.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/plan.js),
  [src/f-planner/doc.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/doc.js),
  [src/f-planner/templates](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/templates)
- Ticket init, creation, listing, updates, and shared parsing:
  [src/f-ticket/f-ticket](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/f-ticket),
  [src/f-ticket/init.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/init.js),
  [src/f-ticket/new.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/new.js),
  [src/f-ticket/list.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/list.js),
  [src/f-ticket/update.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/update.js),
  [src/f-ticket/lib.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/lib.js)
- Report daemon, API, state, and ticket editing:
  [src/f-report/f-report](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/f-report),
  [src/f-report/lib/cli.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/cli.js),
  [src/f-report/lib/daemon.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/daemon.js),
  [src/f-report/lib/server.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/server.js),
  [src/f-report/lib/global-state.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/global-state.js),
  [src/f-report/lib/process-control.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/process-control.js),
  [src/f-report/lib/tickets.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/tickets.js),
  [src/f-report/lib/ticket-editor.js](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/lib/ticket-editor.js)
- Report web app:
  [src/f-report/web/src](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/web/src)

Verification:

- `npm test`
- `npm run build:f-report-web`
- `npm run test:f-report`

Maintainer rules:

- Keep consumer-facing `AGENTS.md` files focused on tool usage, not repo internals.
- If you change generated file names, templates, or CLI output, update tests and `README.md` in the same change.
- If you change `f-report` API payloads or bootstrap data, update the web app and backend together.
