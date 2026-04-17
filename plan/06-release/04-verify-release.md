# Verify Release

## Goal

Confirm the released tool behaves the same as the tested build.

## Checks

- Run the documented install flow.
- Run the canonical example through the released CLI.
- Verify deterministic output.
- Verify MCP wrapper behavior if included in the release.

## Exit Criteria

- Release artifacts behave as expected.
- Any release-specific regressions are documented and fixed.
