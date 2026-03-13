---
id: 0012
title: Implement init folder bootstrapping for all modes
type: job
parent: 0002
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0009, 0011]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0002`.

Implement the mode-specific creation of `_TICKETS`, `_PLAN`, and `_DOCS` from the interactive `tick init` flow.

## Acceptance criteria
- [ ] `tick init` creates `_TICKETS` for ticketing mode.
- [ ] `tick init` creates `_PLAN` and `_DOCS` for planning mode.
- [ ] `tick init` creates all three folders for combined mode.
- [ ] Existing-path validation prevents partial or conflicting initialization from silently succeeding.

## Notes
This is the main implementation job for the new init behavior.

## Log
- 2026-03-13: created as child job of workstream 0002
