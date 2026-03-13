---
id: 0008
title: Audit and centralize ticket directory naming
type: job
parent: 0001
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: []
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0001`.

Identify every place where `_ISSUES` is hardcoded and introduce shared constants/helpers so subsequent migrations update one canonical path model.

## Acceptance criteria
- [ ] All `_ISSUES` path assumptions in `src/tick` are identified and mapped to shared helpers/constants.
- [ ] All `_ISSUES` path assumptions in `src/tick-report` are identified and mapped to shared helpers/constants.
- [ ] A single canonical execution directory constant/helper is defined for reuse.
- [ ] The migration approach for legacy `_ISSUES` compatibility is captured in code comments or implementation structure.

## Notes
This job is the entry point for the storage migration.

## Log
- 2026-03-13: created as child job of workstream 0001
