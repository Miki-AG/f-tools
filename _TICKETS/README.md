# _TICKETS

Execution tickets only.

## Ticket Types

- `workstream`
  A major execution track. Use one per high-level delivery stream.
- `job`
  A concrete implementation task. JOB tickets may point to a WORKSTREAM through `parent`.

## Required Fields

- `type: workstream|job`
- `parent:` only for JOB tickets
- `depends_on: []` for explicit ordering
- `status`, `priority`, `owner`, `labels`, `created`, `updated`

## Workflow

1. Create WORKSTREAM tickets from an accepted plan.
2. Break each WORKSTREAM into JOB tickets.
3. Keep ticket status, dependencies, and logs current while implementing.
4. Update `_DOCS/` when the work is shipped.

## Related Docs

- Root workflow: [`README.md`](/Users/miguelarmengol/_dev/ocecat/tick/README.md)
- Planning rules: [`_PLAN/README.md`](/Users/miguelarmengol/_dev/ocecat/tick/_PLAN/README.md)
- Documentation rules: [`_DOCS/README.md`](/Users/miguelarmengol/_dev/ocecat/tick/_DOCS/README.md)
