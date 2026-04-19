# Define Install And Launch Contract

[Back to Execution Map](../EXECMAP.md)

## Goal

Define the install and launch contract for `v0.3` so docs, packaging, and
smoke tests all verify the same user-facing behavior.

## Required User Flows

### Global CLI Install

- A user installs the published package with the standard npm ecosystem flow.
- Node is the runtime prerequisite for that installed-package path.
- Running `wirefmt --version` succeeds after install.
- Running `wirefmt format` and `wirefmt lint` succeeds without Bun as a
  prerequisite.
- The installed binary should be a Node-launched wrapper around the packaged
  bundle, not a Bun shebang that points back to TypeScript source.

### Local Package Consumption

- A user can add the published tarball or package to a project and invoke the
  shipped binaries from `node_modules/.bin/`.
- This flow should match the documented package shape.
- The reference smoke-test flow should use a normal Node package install path
  for the tarball, so packaged-install verification matches the default user
  story.

### MCP Launch

- An MCP client can point directly at `wirefmt-mcp`.
- The installed MCP entrypoint launches without requiring users to wire Bun
  manually.
- `wirefmt-mcp` should be a Node-launched installed binary backed by the
  packaged bundle in `dist/`.
- The server still exposes:
  - `wirefmt.format`
  - `wirefmt.lint`

## Documentation Contract

- README install docs must describe the default published install path and
  distinguish it from Bun-based contributor setup.
- MCP docs must show the simplest supported client wiring.
- Contributor setup docs may still mention Bun, but only as the repo/runtime
  requirement for development.

## Verification Contract

- Release verification must test the same install and launch flows described in
  the docs.
- Smoke tests should verify both entrypoints from an installed package shape,
  not only from repo source.

## Non-Goals For `v0.3`

- Do not promise every package manager or operating-system-specific installer.
- Do not add editor plugins or managed hosting as part of the install story.
- Do not split documentation across multiple equally preferred runtime paths.

## Exit Criteria

- One default install story is explicit.
- One default MCP launch story is explicit.
- The installed-package contract is concrete enough to drive package layout and
  smoke tests.
- Docs and release verification test the same contract.
