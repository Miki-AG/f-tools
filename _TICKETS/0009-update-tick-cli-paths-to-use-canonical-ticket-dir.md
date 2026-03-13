---
id: 0009
title: Update tick CLI paths to use canonical ticket dir
type: job
parent: 0001
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0008]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0001`.

Move `tick` CLI modules off direct `_ISSUES` literals and onto the canonical `_TICKETS` path model.

## Acceptance criteria
- [ ] `src/tick/lib.js` exposes canonical ticket-directory helpers for CLI modules.
- [ ] `init`, `new`, `update`, `list`, and the shell entrypoint use the shared directory logic.
- [ ] CLI output paths and error messages use `_TICKETS`.
- [ ] Any needed legacy `_ISSUES` fallback behavior is wired into the CLI side.

## Notes
This job should land before interactive init and schema work begin.

## Log
- 2026-03-13: created as child job of workstream 0001
