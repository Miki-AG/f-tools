---
id: 0003
title: Extend ticket schema for WORKSTREAM and JOB
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

The execution model needs to support hierarchical tickets. Tickets should carry `type`, `parent`, and `depends_on` metadata so WORKSTREAM/JOB relationships can be validated and rendered by CLI and report tools.

Primary files called out in the plan:

- `src/tick/templates/issue.md` or its renamed replacement
- `src/tick/lib.js`
- `src/tick/new.js`
- `src/tick/update.js`
- `src/tick/list.js`

## Acceptance criteria
- [ ] Ticket template and parsing logic support `type: workstream|job`.
- [ ] Ticket template and parsing logic support optional `parent` and `depends_on` fields.
- [ ] `tick new` and `tick update` can create and modify WORKSTREAM/JOB metadata.
- [ ] `tick list` shows ticket type and dependency information.
- [ ] Validation prevents invalid parent/dependency combinations, including self-dependencies.

## Notes
This is the schema workstream other features depend on, especially planning automation and report filtering.

## Log
- 2026-03-13: created from Workstream 3 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
