---
id: 0005
title: Update tick-report for WORKSTREAM views
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

`tick-report` needs to understand WORKSTREAM/JOB metadata and let the user focus a project view on a single WORKSTREAM plus its child JOBs.

Primary files called out in the plan:

- `src/tick-report/lib/tickets.js`
- `src/tick-report/web/src/lib/types.ts`
- `src/tick-report/web/src/pages/project-page.tsx`
- `src/tick-report/web/src/pages/ticket-page.tsx`
- legacy UI files under `src/tick-report/files/` if legacy mode remains supported

## Acceptance criteria
- [ ] Report payloads include `type`, `parent`, and `depends_on`.
- [ ] The project page supports selecting a WORKSTREAM as a filter/focus target.
- [ ] A WORKSTREAM-focused view shows the WORKSTREAM plus all JOBs attached to it through `parent`.
- [ ] UI surfaces hierarchy/dependency information clearly enough to inspect the execution structure.
- [ ] Legacy mode is updated too if it remains a supported UI path.

## Notes
This workstream depends on the execution schema being in place first.

## Log
- 2026-03-13: created from Workstream 5 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
