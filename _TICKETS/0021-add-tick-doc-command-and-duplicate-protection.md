---
id: 0021
title: Add tick doc command and duplicate protection
type: job
parent: 0004
status: open
priority: p1
owner:
labels: [JOB, UPDATE-WORKFLOW]
depends_on: [0012, 0019]
created: 2026-03-13
updated: 2026-03-13
---

## Context
Breakdown job for workstream `0004`.

Add the documentation generator for `_DOCS` and enforce safe file-creation behavior across the new generator commands.

## Acceptance criteria
- [ ] `tick doc <name>` creates documentation under `_DOCS`.
- [ ] Generated docs use the documentation template and deterministic naming rules.
- [ ] Duplicate/conflicting targets fail without overwriting existing files.
- [ ] Shared duplicate-protection behavior is consistent across req/plan/doc generators.

## Notes
This job completes the template-backed generator surface.

## Log
- 2026-03-13: created as child job of workstream 0004
