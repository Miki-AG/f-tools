---
id: 0027
title: Add tests for interactive init modes
type: job
parent: 0006
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0013, 0026]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0006`.

Cover the new `tick init` interaction model and the resulting folder bootstrap behavior.

## Acceptance criteria
- [ ] Tests cover ticketing-only init.
- [ ] Tests cover planning-only init.
- [ ] Tests cover combined init.
- [ ] Tests cover generated README/index bootstrap behavior and invalid/conflicting init states.

## Notes
This job may require extending the existing harness for stdin-driven commands.

## Log
- 2026-03-13: created as child job of workstream 0006
