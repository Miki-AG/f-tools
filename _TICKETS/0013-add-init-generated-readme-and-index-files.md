---
id: 0013
title: Add init-generated README and index files
type: job
parent: 0002
status: open
priority: p2
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0012]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0002`.

Bootstrap minimal guidance files in initialized folders so agents can follow the workflow immediately after `tick init`.

## Acceptance criteria
- [ ] `_TICKETS` receives a minimal README/index when ticketing is initialized.
- [ ] `_PLAN` receives a minimal README/index when planning is initialized.
- [ ] `_DOCS` receives a minimal README/index when planning is initialized.
- [ ] Generated guidance matches the selected initialization mode and does not create irrelevant files.

## Notes
This job should stay minimal; the full documentation rewrite is tracked separately.

## Log
- 2026-03-13: created as child job of workstream 0002
