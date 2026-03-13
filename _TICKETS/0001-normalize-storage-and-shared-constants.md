---
id: 0001
title: Normalize storage and shared constants
type: workstream
status: open
priority: p1
owner:
labels: [WORKSTREAM, UPDATE-WORKFLOW]
depends_on: []
created: 2026-03-13
updated: 2026-03-13
---

## Context
High-level workstream derived from `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`.

This workstream establishes `_TICKETS` as the canonical execution folder and removes scattered `_ISSUES` assumptions across `tick` and `tick-report`.

Primary files called out in the plan:

- `src/tick/lib.js`
- `src/tick/init.js`
- `src/tick/new.js`
- `src/tick/update.js`
- `src/tick/list.js`
- `src/tick/tick`
- `src/tick-report/lib/constants.js`
- `src/tick-report/lib/tickets.js`
- `src/tick-report/lib/ticket-editor.js`
- `src/tick-report/lib/cli.js`
- `src/tick-report/lib/global-state.js`
- `src/tick-report/lib/process-control.js`
- `src/tick-report/lib/server.js`

## Acceptance criteria
- [ ] Shared constants/path helpers define `_TICKETS` as the canonical execution directory.
- [ ] `tick` and `tick-report` consume the shared naming/path logic instead of hardcoding `_ISSUES`.
- [ ] User-facing messages and output paths reference `_TICKETS`.
- [ ] Legacy `_ISSUES` fallback behavior is either implemented or explicitly removed as a conscious rollout decision.

## Notes
This is the foundational migration workstream and should land before other workflow changes.

## Log
- 2026-03-13: created from Workstream 1 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
