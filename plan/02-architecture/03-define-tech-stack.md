# Define Tech Stack

## Goal

Choose a runtime and toolchain that fit a small, deterministic CLI and MCP tool.

## Decision

`wirefmt` will use Bun and TypeScript for `v0-poc`.

## Why

- The formatter core is mostly deterministic string parsing and rendering, which fits TypeScript well.
- Bun gives a fast local loop for CLI work and test execution.
- The project needs both a CLI and an MCP tool, and TypeScript keeps those adapters close to the core engine.
- Bun keeps the setup lightweight for a small tool.

## Runtime And Tooling

- Runtime: Bun
- Language: TypeScript
- Testing: `bun test`
- Validation: `zod`
- MCP: TypeScript MCP wrapper on Bun

## Project Shape

- `src/core/` for parsing, box detection, normalization, and rendering
- `src/cli/` for `format` and `lint`
- `src/mcp/` for the MCP wrapper
- `test/fixtures/` for golden input and output cases

## Architectural Rule

Keep one core formatting engine and make the CLI and MCP layers thin adapters around it.

## Exit Criteria

- The runtime and language are fixed.
- Core tooling is explicit enough to scaffold the project.
- The architecture keeps one formatter engine with thin interface layers.
