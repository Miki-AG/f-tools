---
id: 0011
title: Design interactive init flow and validation states
type: job
parent: 0002
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0008]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0002`.

Define the interactive prompt flow, expected answers, and error/guard behavior for `tick init`.

## Acceptance criteria
- [ ] Prompt wording and accepted choices for ticketing only, planning only, and both are defined.
- [ ] Init guard behavior is defined for empty repos, partially initialized repos, and conflicting existing paths.
- [ ] The CLI fallback/help behavior for non-interactive misuse is defined.
- [ ] The chosen flow is simple enough to cover in automated tests.

## Notes
This job reduces rework in the implementation phase.

## Log
- 2026-03-13: created as child job of workstream 0002
