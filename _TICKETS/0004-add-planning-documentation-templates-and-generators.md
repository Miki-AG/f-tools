---
id: 0004
title: Add planning and documentation templates and generators
type: workstream
status: open
priority: p1
owner:
labels: [WORKSTREAM, UPDATE-WORKFLOW]
depends_on: [0001, 0003]
created: 2026-03-13
updated: 2026-03-13
---

## Context
High-level workstream derived from `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`.

The planning module needs first-class templates and generation commands for requirements, plans, and documentation. The commands should create deterministic files under `_PLAN` and `_DOCS` and avoid destructive overwrites.

Primary files called out in the plan:

- `src/tick/templates/`
- new command modules under `src/tick/`
- `src/tick/tick`

## Acceptance criteria
- [ ] Requirements, planning, and documentation templates exist under `src/tick/templates`.
- [ ] New CLI commands create requirement, plan, and documentation documents from templates.
- [ ] Generated planning files use deterministic folder/file naming under `_PLAN`.
- [ ] Documentation files land in `_DOCS` with deterministic naming.
- [ ] Generators refuse invalid duplicates or destructive overwrites.

## Notes
This workstream should follow the schema/storage decisions so new generators align with the final workflow model.

## Log
- 2026-03-13: created from Workstream 4 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
