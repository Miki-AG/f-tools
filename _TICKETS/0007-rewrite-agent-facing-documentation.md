---
id: 0007
title: Rewrite agent-facing documentation
type: workstream
status: open
priority: p2
owner:
labels: [WORKSTREAM, UPDATE-WORKFLOW]
depends_on: [0001, 0002, 0003, 0004, 0005]
created: 2026-03-13
updated: 2026-03-13
---

## Context
High-level workstream derived from `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`.

The documentation needs to teach agents the entire workflow from PRD to REQ to PLAN to WORKSTREAM/JOB execution to final docs. This is part of the feature, not a polish pass.

Primary files called out in the plan:

- `README.md`
- `_PLAN/README.md`
- `_TICKETS/README.md`
- `_DOCS/README.md`

## Acceptance criteria
- [ ] Root `README.md` explains the new planning + execution pipeline.
- [ ] The root README includes a clear index that tells agents which document to read for planning, tickets, and implementation docs.
- [ ] `_PLAN`, `_TICKETS`, and `_DOCS` each have focused README guidance.
- [ ] Naming conventions and command examples match the implemented behavior.
- [ ] Documentation explains when to create PRD, REQ, PLAN, WORKSTREAM/JOB tickets, and post-implementation docs.

## Notes
This should follow the command-surface changes so the written guidance matches the actual workflow.

## Log
- 2026-03-13: created from Workstream 7 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
