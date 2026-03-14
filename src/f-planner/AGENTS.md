# f-planner Agent Guide

Use `f-planner` when you need to create planning or documentation files in the repo you are working on.

What it is for:

- `prd` creates the top-level product requirements doc in `_PLAN/`
- `req` creates a feature requirement doc in `_PLAN/`
- `plan` creates a feature plan doc in `_PLAN/`
- `doc` creates a post-implementation doc in `_DOCS/`

Use it in this order:

1. Ensure the target repo has planning folders. If not, run `./f-ticket init --modules planning` or `./f-ticket init --modules both`.
2. Run `./f-planner prd` to create `_PLAN/010_PRD.md` if it is missing.
3. Update `_PLAN/010_PRD.md` when the work affects overall product direction.
4. Run `./f-planner req "<Feature name>"` to create the feature requirement doc.
5. Run `./f-planner plan "<Feature name>"` to create the matching implementation plan doc.
6. Run `./f-planner doc "<Document name>"` only after behavior is implemented or changed.

Generated files:

- `./f-planner prd` creates `_PLAN/010_PRD.md`
- `./f-planner req "Update Workflow"` creates `_PLAN/update-workflow/010_update-workflow.REQ.md`
- `./f-planner plan "Update Workflow"` creates `_PLAN/update-workflow/020_update-workflow.PLAN.md`
- `./f-planner doc "Workflow Guide"` creates `_DOCS/workflow-guide.DOC.md`

Agent rules:

- Use planning docs for intended behavior and sequencing.
- Use documentation docs for implemented behavior, not plans or guesses.
- Do not invent alternate naming schemes; use the files created by `f-planner`.
- If a generated file already exists, update that file instead of creating a parallel one with a different name.

Typical commands:

```sh
./f-planner prd
./f-planner req "Update Workflow"
./f-planner plan "Update Workflow"
./f-planner doc "Workflow Guide"
```
