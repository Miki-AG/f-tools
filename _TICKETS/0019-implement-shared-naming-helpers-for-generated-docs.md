---
id: 0019
title: Implement shared naming helpers for generated docs
type: job
parent: 0004
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0018]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0004`.

Implement shared logic for deterministic folder and filename generation under `_PLAN` and `_DOCS`.

## Acceptance criteria
- [ ] Feature slug generation is centralized and deterministic.
- [ ] `_PLAN` folder naming follows the requested feature-oriented hierarchy.
- [ ] Requirement and plan filenames use deterministic numbering and naming.
- [ ] Documentation filename rules are centralized for reuse by generators.

## Notes
This job prevents path logic from fragmenting across multiple command modules.

## Log
- 2026-03-13: created as child job of workstream 0004
