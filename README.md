# f-tools

File-based planning and execution workflow for AI agents.

`f-ticket` keeps execution tickets in the repo. `f-planner` manages planning and documentation artifacts. `f-report` exposes ticket state over a local web UI so you can monitor WORKSTREAMs and JOBs from any browser on your network.

## Read This First

- Root workflow: [`README.md`](/Users/miguelarmengol/_dev/ocecat/tick/README.md)
- Planning rules: [`_PLAN/README.md`](/Users/miguelarmengol/_dev/ocecat/tick/_PLAN/README.md)
- Execution ticket rules: [`_TICKETS/README.md`](/Users/miguelarmengol/_dev/ocecat/tick/_TICKETS/README.md)
- Documentation rules: [`_DOCS/README.md`](/Users/miguelarmengol/_dev/ocecat/tick/_DOCS/README.md)

## Repo Layout

- `_PLAN/`
  Planning artifacts only. Keep `010_PRD.md` at the top level and create feature folders for requirement/plan pairs.
- `_TICKETS/`
  Execution tickets only. Use WORKSTREAM tickets for major tracks and JOB tickets for concrete tasks.
- `_DOCS/`
  Post-implementation documentation only.

## Pipeline

1. Person writes or updates `_PLAN/010_PRD.md`.
2. Person creates a feature requirement doc in `_PLAN/<feature>/010_<feature>.REQ.md`.
3. Agent creates a feature plan doc in `_PLAN/<feature>/020_<feature>.PLAN.md`.
4. Agent creates one WORKSTREAM ticket per major execution track.
5. Agent creates JOB tickets under the relevant WORKSTREAM.
6. Agent executes the JOB tickets and keeps `_TICKETS/` current.
7. Agent updates `_DOCS/` when behavior is implemented or changed.

## Ticket Model

- `type: workstream|job`
- `parent:` only for JOB tickets, pointing at a WORKSTREAM id
- `depends_on: []` for explicit ordering/dependency links

Use WORKSTREAM tickets to group related execution. Use JOB tickets for implementable chunks. A JOB may depend on other tickets, but its `parent` must point to a WORKSTREAM.

## Commands

Requirements:

- Node.js 18+
- zsh for the wrappers

Initialize a repo:

```sh
./f-ticket init
./f-ticket init --modules tickets
./f-ticket init --modules planning
./f-ticket init --modules both
```

Create and manage tickets:

```sh
./f-ticket new "Storage migration" --type workstream --priority p1 --labels platform
./f-ticket new "Patch CLI paths" --type job --parent 0001 --depends-on 0001 --owner codex
./f-ticket list
./f-ticket update 0002 --status doing --add-label active --log "Started implementation"
```

Create planning and documentation artifacts:

```sh
./f-planner req "Update Workflow"
./f-planner plan "Update Workflow"
./f-planner doc "Workflow Guide"
```

## f-report

Build the web UI once before starting the report server:

```sh
npm run build:f-report-web
```

Then run:

```sh
./f-report start --host 127.0.0.1 --port 4174
./f-report status
./f-report stop
```

Behavior summary:

- one `f-report` daemon serves all attached repos
- report data is read from `./_TICKETS`
- project views can focus on a single WORKSTREAM and show its child JOBs
- ticket detail pages expose hierarchy metadata alongside editable ticket fields

## Agent Expectations

- Read the root README first.
- Use `_PLAN` for planning, `_TICKETS` for execution, `_DOCS` for finished behavior docs.
- Do not invent naming. Follow the file names produced by `f-planner req`, `f-planner plan`, and `f-planner doc`.
- Keep documentation synchronized with the implemented behavior, not the intended behavior.
