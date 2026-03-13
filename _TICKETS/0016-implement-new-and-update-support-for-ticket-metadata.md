---
id: 0016
title: Implement new and update support for ticket metadata
type: job
parent: 0003
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0015]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0003`.

Add CLI flag handling so `tick new` and `tick update` can create and modify WORKSTREAM/JOB hierarchy fields.

## Acceptance criteria
- [ ] `tick new` accepts ticket hierarchy metadata flags.
- [ ] `tick update` accepts ticket hierarchy metadata flags.
- [ ] Ticket writes preserve valid front matter structure and update timestamps correctly.
- [ ] Invalid hierarchy combinations fail with clear user-facing errors.

## Notes
This job depends on the shared validation model being complete first.

## Log
- 2026-03-13: created as child job of workstream 0003
