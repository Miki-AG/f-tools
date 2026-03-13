---
id: 0028
title: Add tests for ticket hierarchy and doc generators
type: job
parent: 0006
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0021, 0026]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0006`.

Add coverage for the new WORKSTREAM/JOB metadata and the req/plan/doc command surface.

## Acceptance criteria
- [ ] Tests cover valid and invalid WORKSTREAM/JOB ticket creation.
- [ ] Tests cover valid and invalid hierarchy/dependency updates.
- [ ] Tests cover list output for type, parent, and dependencies.
- [ ] Tests cover req/plan/doc generation and duplicate protection.

## Notes
This job verifies most of the new CLI functionality introduced by the workflow update.

## Log
- 2026-03-13: created as child job of workstream 0006
