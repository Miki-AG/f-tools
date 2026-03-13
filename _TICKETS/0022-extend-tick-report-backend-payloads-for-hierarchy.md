---
id: 0022
title: Extend tick-report backend payloads for hierarchy
type: job
parent: 0005
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0010, 0015]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0005`.

Teach `tick-report` backend readers and API payloads to emit ticket hierarchy and dependency metadata.

## Acceptance criteria
- [ ] Report ticket records include `type`.
- [ ] Report ticket records include `parent`.
- [ ] Report ticket records include `depends_on`.
- [ ] Backend parsing remains resilient to malformed or legacy ticket files.

## Notes
This job is the backend prerequisite for all WORKSTREAM-focused UI work.

## Log
- 2026-03-13: created as child job of workstream 0005
