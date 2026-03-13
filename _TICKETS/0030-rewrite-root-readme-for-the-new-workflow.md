---
id: 0030
title: Rewrite root README for the new workflow
type: job
parent: 0007
status: open
priority: p2
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0012, 0017, 0021]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0007`.

Rewrite the root README so it explains the new planning + execution pipeline and the updated command surface.

## Acceptance criteria
- [ ] Root `README.md` explains `_PLAN`, `_TICKETS`, and `_DOCS`.
- [ ] Root `README.md` documents the new initialization modes.
- [ ] Root `README.md` documents WORKSTREAM/JOB ticketing and the req/plan/doc commands.
- [ ] The README includes a top-level navigation/index for agents.

## Notes
This job should happen after the command surface is stable enough to document accurately.

## Log
- 2026-03-13: created as child job of workstream 0007
