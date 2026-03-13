---
id: 0029
title: Add tick-report tests for WORKSTREAM-focused views
type: job
parent: 0006
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0025, 0026]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0006`.

Add report-side coverage for hierarchy-aware payloads and the WORKSTREAM-focused project view.

## Acceptance criteria
- [ ] Report tests cover hierarchy/dependency fields in API payloads.
- [ ] Report tests cover selecting a WORKSTREAM and seeing its child JOBs.
- [ ] Report tests cover fallback behavior for legacy or malformed ticket data where relevant.
- [ ] The full report test suite passes after the workflow update.

## Notes
This job closes the test gap on the report surface.

## Log
- 2026-03-13: created as child job of workstream 0006
