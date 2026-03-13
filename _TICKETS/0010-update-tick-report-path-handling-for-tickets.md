---
id: 0010
title: Update tick-report path handling for tickets
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

Move `tick-report` backend, frontend labels, and process-control logic to the canonical `_TICKETS` naming model.

## Acceptance criteria
- [ ] `tick-report` constants and file readers use the shared canonical ticket directory name.
- [ ] User-facing report errors, labels, and paths reference `_TICKETS`.
- [ ] Global-state and process-control code continue to work with the new directory name.
- [ ] Legacy compatibility behavior, if retained, is implemented consistently on the report side.

## Notes
This job unblocks report-specific follow-up work.

## Log
- 2026-03-13: created as child job of workstream 0001
