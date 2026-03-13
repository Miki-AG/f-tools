---
id: 0014
title: Define ticket front matter schema and template updates
type: job
parent: 0003
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0008]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0003`.

Update the base ticket markdown shape so WORKSTREAM/JOB hierarchy can be stored directly in front matter.

## Acceptance criteria
- [ ] The base ticket template uses ticket-oriented wording instead of issue-oriented wording.
- [ ] The front matter schema includes `type`, optional `parent`, and `depends_on`.
- [ ] The default values and required fields for workstream/job tickets are defined.
- [ ] The template shape is compatible with existing markdown parsing utilities.

## Notes
This is the schema contract other jobs will implement against.

## Log
- 2026-03-13: created as child job of workstream 0003
