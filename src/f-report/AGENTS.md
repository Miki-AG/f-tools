# f-report Agent Guide

Use `f-report` when you need a live browser view of ticket state across one or more repositories, or when you want to edit ticket fields through the local web UI.

What it is for:

- start a local report server
- attach the current repo to the shared server
- inspect ticket state in a browser
- view workstream and job hierarchy
- edit ticket fields from the ticket detail page

Core behavior:

- One `f-report` daemon can serve multiple attached repos.
- Report data comes from each repo's `_TICKETS/` folder.
- The web UI shows attached projects, project ticket tables, and ticket detail pages.

Recommended usage flow:

1. Build the web UI once with `npm run build:f-report-web`.
2. From a target repo, run `./f-report start`.
3. Open the printed URL in a browser.
4. If you start `f-report` from another repo, it reuses the same daemon and attaches that repo too.
5. Use `./f-report status` to confirm the daemon is running and the current repo is attached.
6. Use `./f-report stop` only when you want to shut down the shared daemon.

What it reads from the target repo:

- `_TICKETS/*.md` for ticket data
- `_TICKETS/status.json` for per-ticket updates and popup notices
- `_TICKETS/config.json` for project column preferences

Agent rules:

- Use `f-report` for visibility and light editing, not as a replacement for keeping ticket files well structured.
- Expect multi-repo behavior; stopping the daemon affects all attached repos.
- If the UI appears stale or missing, rebuild the web app before assuming the server is broken.

Typical commands:

```sh
npm run build:f-report-web
./f-report start --host 127.0.0.1 --port 4174
./f-report status
./f-report stop
```
