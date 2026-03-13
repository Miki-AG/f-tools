---
id: 0006
title: Update tests and fixtures
type: workstream
status: open
priority: p1
owner:
labels: [WORKSTREAM, UPDATE-WORKFLOW]
depends_on: [0001, 0002, 0003, 0004, 0005]
created: 2026-03-13
updated: 2026-03-13
---

## Context
High-level workstream derived from `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`.

The current test harnesses and fixtures are coupled to `_ISSUES`, issue-oriented wording, and the pre-hierarchy ticket schema. They need a coordinated update once the main behavior changes are in place.

Primary files called out in the plan:

- `test/tick/run.js`
- `test/tick-report/run.js`
- `test/tick/...` scenarios and fixtures

## Acceptance criteria
- [ ] Tick test harnesses and fixtures reflect `_TICKETS` instead of `_ISSUES`.
- [ ] Interactive `tick init` behavior is covered by tests.
- [ ] WORKSTREAM/JOB validation and list output are covered by tests.
- [ ] Planning/document generation commands are covered by tests.
- [ ] WORKSTREAM filtering in `tick-report` is covered by tests.
- [ ] `npm test` and `npm run test:tick-report` pass.

## Notes
This should run after the primary behavior workstreams have stabilized enough to avoid fixture churn.

## Log
- 2026-03-13: created from Workstream 6 in `_PLAN/010_update_workflow/020_update_workflow.PLAN.md`
