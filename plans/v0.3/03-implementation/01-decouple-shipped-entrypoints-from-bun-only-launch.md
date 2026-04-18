# Decouple Shipped Entrypoints From Bun-Only Launch

[Back to Plan](../PLAN.md)

## Goal

Make the shipped `wirefmt` and `wirefmt-mcp` entrypoints launch independently
of a Bun-only end-user runtime assumption by moving the installed package onto
Node-launched bundled entrypoints.

## Tasks

- Replace the current `#!/usr/bin/env bun` package entrypoints with thin
  `#!/usr/bin/env node` wrappers.
- Remove the remaining Bun-only runtime dependency from the shipped CLI code
  path:
  - replace `Bun.file(...).text()` in `src/cli/runtime.ts`
  - use `node:fs/promises` for packaged file reads
- Keep the existing CLI and MCP runtime logic on `process.stdin`,
  `process.stdout`, `process.stderr`, and the shared core engine.
- Ensure installed binaries execute bundled JavaScript from `dist/` rather than
  importing TypeScript directly from `src/`.
- Preserve the existing CLI command names and MCP server behavior.

## Constraints

- Keep the implementation narrow and packaging-focused.
- Reuse the existing shared core rather than branching the runtime behavior.
- Avoid turning this step into a source-level architecture rewrite; the goal is
  to remove Bun from the installed runtime path, not to redesign the product.

## Exit Criteria

- Installed `wirefmt` launches without Bun as the user-facing requirement.
- Installed `wirefmt-mcp` launches without Bun as the user-facing requirement.
- The published `bin/` scripts no longer use `#!/usr/bin/env bun`.
- CLI and MCP behavior remain aligned with the existing shared core.
