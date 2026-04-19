# Verify CLI And MCP Launch Flows

[Back to Execution Map](../EXECMAP.md)

## Goal

Verify that the documented `v0.3` launch flows work for both human CLI use and
MCP-client integration, using the installed Node-launched package surface as
the primary verification target.

## Tasks

- Confirm CLI launch and core commands work from the installed package through
  the packaged Node entrypoint.
- Confirm the installed MCP server starts and exposes the expected tool list
  through the packaged Node entrypoint.
- Check that docs, smoke tests, and shipped artifacts are describing the same
  flow.
- Check that the default verified install path matches the `v0.3` contract:
  - normal package install
  - Node-launched `wirefmt`
  - Node-launched `wirefmt-mcp`
  - no Bun-specific manual wiring for installed users

## Verification Notes

- CLI verification should cover at least:
  - `wirefmt --version`
  - one `format` call
  - one `lint` call
- MCP verification should cover at least:
  - server launch
  - tool registration
  - one `wirefmt.format` call
  - one `wirefmt.lint` call

## Exit Criteria

- The documented CLI flow is proven from an installed package.
- The documented MCP flow is proven from an installed package.
- The verified launch path matches the package layout and runtime assumptions
  defined in the `v0.3` contracts.
- No Bun-specific manual wiring is required in the default user path.
