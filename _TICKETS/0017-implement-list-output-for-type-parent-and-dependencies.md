---
id: 0017
title: Implement list output for type parent and dependencies
type: job
parent: 0003
status: open
priority: p2
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0016]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0003`.

Update `tick list` so hierarchy-relevant fields are visible for planning and execution workflows.

## Acceptance criteria
- [ ] `tick list` output includes ticket type.
- [ ] `tick list` output includes parent linkage where applicable.
- [ ] `tick list` output includes dependency information.
- [ ] Output remains stable and machine-readable enough for existing workflows.

## Notes
This job completes the CLI visibility side of the schema change.

## Log
- 2026-03-13: created as child job of workstream 0003
