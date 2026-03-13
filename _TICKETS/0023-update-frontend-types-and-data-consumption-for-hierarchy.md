---
id: 0023
title: Update frontend types and data consumption for hierarchy
type: job
parent: 0005
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0022]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0005`.

Update the web UI data model so project and ticket pages can consume the new WORKSTREAM/JOB metadata cleanly.

## Acceptance criteria
- [ ] Frontend types include hierarchy/dependency fields.
- [ ] API consumption paths handle the expanded ticket payload shape.
- [ ] Existing project/ticket rendering continues to work with the new data.
- [ ] The hierarchy fields are available for downstream UI filtering and display logic.

## Notes
This job should remain focused on data plumbing, not final UX.

## Log
- 2026-03-13: created as child job of workstream 0005
