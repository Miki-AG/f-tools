# Agent Guide

Use `f-tools` to manage a file-based workflow in the repository you are operating on.

Start with [README.md](/Users/miguelarmengol/_dev/ocecat/f-tools/README.md) for the overall workflow, then use the tool-specific guide that matches the job:

- Planning and documentation flow: [src/f-planner/AGENTS.md](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-planner/AGENTS.md)
- Ticket creation and execution tracking: [src/f-ticket/AGENTS.md](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-ticket/AGENTS.md)
- Browser-based monitoring and ticket editing: [src/f-report/AGENTS.md](/Users/miguelarmengol/_dev/ocecat/f-tools/src/f-report/AGENTS.md)

If the task is to maintain or modify `f-tools` itself rather than use it in another repo, switch to [AGENTS.MAINTAINER.md](/Users/miguelarmengol/_dev/ocecat/f-tools/AGENTS.MAINTAINER.md).

Use this workflow unless the user asks for something else:

1. Initialize the target repo if needed with `./f-ticket init`.
2. Capture planning artifacts with `./f-planner prd`, `./f-planner req`, `./f-planner plan`, and `./f-planner doc` as needed.
3. Create execution tickets with `./f-ticket new`.
4. Keep ticket status, labels, checks, and log entries current with `./f-ticket update`.
5. Use `./f-report start` when you need a live view of one or more repos in a browser.

File system contract in the target repo:

- `_PLAN/` holds planning artifacts
- `_DOCS/` holds post-implementation docs
- `_TICKETS/` holds execution tickets plus report state such as `status.json` and `config.json`

Do not treat this file as maintainer documentation for `f-tools` itself. It is only a routing guide for agents using the tools.
