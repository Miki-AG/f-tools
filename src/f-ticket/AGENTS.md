# f-ticket Agent Guide

Use `f-ticket` when you need to initialize the file-based workflow in a repo, create execution tickets, list work, or keep ticket state current while executing tasks.

What it is for:

- `init` prepares `_TICKETS/` and optionally `_PLAN/` plus `_DOCS/`
- `new` creates a ticket markdown file
- `list` shows current tickets
- `update` changes ticket metadata and body sections

Initialization:

- `./f-ticket init --modules tickets` creates `_TICKETS/`
- `./f-ticket init --modules planning` creates `_PLAN/` and `_DOCS/`
- `./f-ticket init --modules both` creates all three

Ticket model:

- `workstream` is a major execution track
- `job` is a concrete task under a workstream
- `parent` is used only on `job` tickets and points to a workstream id
- `depends_on` is for explicit ordering between tickets

Recommended usage flow:

1. Run `./f-ticket init` if the repo is not initialized.
2. Create one `workstream` ticket per major track.
3. Create `job` tickets under the correct workstream.
4. Use `./f-ticket list` to inspect active work.
5. Use `./f-ticket update` as soon as status, labels, acceptance checks, or logs change.

Agent rules:

- Keep `_TICKETS/` as the source of truth for execution state.
- Use `workstream` for grouping and `job` for implementable units.
- Update tickets as you work; do not batch all ticket maintenance until the end.
- Record meaningful progress in the ticket log.
- Use acceptance checks to mark completed criteria explicitly.

Typical commands:

```sh
./f-ticket init --modules both
./f-ticket new "Storage migration" --type workstream --priority p1 --labels platform
./f-ticket new "Patch CLI paths" --type job --parent 0001 --depends-on 0001 --owner codex
./f-ticket list
./f-ticket update 0002 --status doing --add-label active --log "Started implementation"
./f-ticket update 0002 --check "CLI paths updated"
```
