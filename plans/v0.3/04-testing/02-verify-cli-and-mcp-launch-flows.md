# Verify CLI And MCP Launch Flows

[Back to Plan](../PLAN.md)

## Goal

Verify that the documented `v0.3` launch flows work for both human CLI use and
MCP-client integration.

## Tasks

- Confirm CLI launch and core commands work from the installed package.
- Confirm the installed MCP server starts and exposes the expected tool list.
- Check that docs, smoke tests, and shipped artifacts are describing the same
  flow.

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
- No Bun-specific manual wiring is required in the default user path.
