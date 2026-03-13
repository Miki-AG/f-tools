---
id: 0015
title: Extend shared parsing and validation for ticket hierarchy
type: job
parent: 0003
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0014]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0003`.

Teach the shared CLI/report parsing helpers to understand type, parent, and dependency fields and validate their allowed combinations.

## Acceptance criteria
- [ ] Shared front matter parsing reads `type`, `parent`, and `depends_on`.
- [ ] Validation rejects invalid ticket types.
- [ ] Validation rejects invalid parent references and self-dependencies.
- [ ] Shared helpers expose enough metadata for both CLI and report consumers.

## Notes
This is the core data-model job for WORKSTREAM/JOB support.

## Log
- 2026-03-13: created as child job of workstream 0003
