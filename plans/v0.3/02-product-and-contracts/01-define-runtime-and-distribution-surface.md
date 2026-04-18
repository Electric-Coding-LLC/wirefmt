# Define Runtime And Distribution Surface

[Back to Plan](../PLAN.md)

## Goal

Define the `v0.3` runtime and packaging surface so contributors and end users
have a clear, intentional split.

## Current State

- The repo uses Bun for development, test, and release tasks.
- The published package currently describes Bun as the prerequisite runtime.
- Both shipped executables point users toward a Bun-backed launch model.

## `v0.3` Contract Decisions

### Contributor Runtime

- Bun remains the primary contributor runtime for local development.
- Repo scripts may stay Bun-based in `v0.3`.
- The release does not need to migrate the repo itself away from Bun.

### End-User Runtime

- Bun should no longer be the default required runtime for end users.
- A published install must provide a portable way to run:
  - `wirefmt`
  - `wirefmt-mcp`
- End users should not need to understand the repo's internal Bun setup in
  order to use the packaged tool.

### Packaging Direction

- `v0.3` chooses one primary distribution story: Node-launched bundled
  JavaScript entrypoints.
- Bun remains the build tool used by maintainers to produce the packaged
  artifacts.
- The published package should ship:
  - thin `#!/usr/bin/env node` wrappers in `bin/`
  - bundled runtime entrypoints in `dist/` for `wirefmt` and `wirefmt-mcp`
- Installed users should run the packaged Node entrypoints, not TypeScript from
  `src/` and not `#!/usr/bin/env bun` shims.
- The shipped runtime path should remove the remaining Bun-specific API usage
  from the installed CLI and MCP code path.

## Responsibilities

### Repository

- Optimize for maintainable development flow with Bun.
- Keep implementation and release workflow simple.

### Published Package

- Optimize for install and launch reliability.
- Present one clear default path for CLI and MCP usage.

## Non-Goals For `v0.3`

- Do not change the formatter's conservative single-box behavior.
- Do not broaden the tool surface beyond the existing CLI and MCP commands.
- Do not require a full runtime rewrite if packaging can solve portability.

## Exit Criteria

- Contributor runtime and end-user runtime are clearly separated.
- The intended published-package shape is explicit:
  - Bun for development and release
  - Node-launched bundled artifacts for installed-package use
- `v0.3` does not accidentally turn into a broader product rewrite.
