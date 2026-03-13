---
id: 0020
title: Add tick req and tick plan commands
type: job
parent: 0004
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0012, 0019]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0004`.

Add CLI commands that create requirement and plan artifacts under `_PLAN` using the new template and naming helpers.

## Acceptance criteria
- [ ] `tick req <name>` creates the expected requirement artifact under `_PLAN`.
- [ ] `tick plan <name>` creates the expected plan artifact under `_PLAN`.
- [ ] Both commands use templates and deterministic naming helpers.
- [ ] Duplicate/conflicting targets fail safely instead of overwriting files.

## Notes
This job covers the planning side of the generator work.

## Log
- 2026-03-13: created as child job of workstream 0004
