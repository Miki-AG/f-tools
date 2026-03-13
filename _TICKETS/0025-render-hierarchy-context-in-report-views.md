---
id: 0025
title: Render hierarchy context in report views
type: job
parent: 0005
status: open
priority: p2
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0024]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0005`.

Render parent/dependency context in project and ticket views, and update the legacy UI path if it remains supported.

## Acceptance criteria
- [ ] Project rows expose enough hierarchy context to identify WORKSTREAM/JOB relationships.
- [ ] Ticket detail views show parent/dependency metadata when present.
- [ ] Legacy UI is updated too if it remains part of the supported product surface.
- [ ] The display avoids ambiguity between hierarchy and dependency relationships.

## Notes
This job completes the visibility side of the report workstream.

## Log
- 2026-03-13: created as child job of workstream 0005
