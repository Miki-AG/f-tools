---
id: 0024
title: Add WORKSTREAM selection and filtering on project page
type: job
parent: 0005
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0023]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0005`.

Implement the project-page control that lets users focus the view on one WORKSTREAM and its child JOBs.

## Acceptance criteria
- [ ] The project page exposes a WORKSTREAM selector or equivalent filter control.
- [ ] Selecting a WORKSTREAM narrows the visible ticket set to that WORKSTREAM and its child JOBs.
- [ ] Clearing the selection restores the full project view.
- [ ] The UI remains usable on desktop and mobile layouts.

## Notes
This is the main user-facing change in the report UI.

## Log
- 2026-03-13: created as child job of workstream 0005
