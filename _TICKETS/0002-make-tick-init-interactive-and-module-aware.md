---
id: 0002
title: Make tick init interactive and module-aware
type: workstream
status: open
priority: p1
owner:
labels: [WORKSTREAM, UPDATE-WORKFLOW]
depends_on: [0001]
created: 2026-03-13
updated: 2026-03-13
---

## Context
High-level workstream derived from `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`.

`tick init` needs to become interactive so a repo can be initialized as ticketing-only, planning-only, or both. It also needs to bootstrap the right top-level folders and minimal guidance files for agents.

Primary files called out in the plan:

- `src/tick/init.js`
- `src/tick/tick`

## Acceptance criteria
- [ ] `tick init` prompts for `1` ticketing only, `2` planning only, or `3` both.
- [ ] Folder creation matches the selected mode: `_TICKETS`, `_PLAN`, `_DOCS`, or the correct combination.
- [ ] Initialization guards correctly handle partial setups and do not assume ticketing is always present.
- [ ] Minimal README/index files are created in the initialized top-level folders so agents know their purpose immediately.

## Notes
This depends on the storage normalization work so the command bootstraps the final directory names.

## Log
- 2026-03-13: created from Workstream 2 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
