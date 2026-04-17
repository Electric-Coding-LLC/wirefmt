# Add Lint Mode

## Goal

Report wireframe issues without rewriting content.

## Tasks

- Reuse parser and detector output to identify issues.
- Define issue categories such as broken border, uneven width, or misaligned edge.
- Add `lint` command output and exit codes.
- Keep issue messages concise and stable.

## Exit Criteria

- `lint` uses the same core analysis as `format`.
- Findings are deterministic.
- Lint mode is useful in CI or editor workflows.
