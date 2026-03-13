---
id: 0026
title: Migrate test harnesses and fixtures to tickets
type: job
parent: 0006
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0010, 0017]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0006`.

Update the test harnesses and fixture conventions so they align with `_TICKETS` and the new ticket terminology.

## Acceptance criteria
- [ ] `test/tick/run.js` supports `_TICKETS`.
- [ ] `test/tick-report/run.js` supports `_TICKETS`.
- [ ] Existing scenario fixtures are migrated or adapted away from `_ISSUES` assumptions.
- [ ] Test naming and fixture wording no longer describe tickets as issues where the product has changed.

## Notes
This is the base test migration job for the rest of the coverage work.

## Log
- 2026-03-13: created as child job of workstream 0006
