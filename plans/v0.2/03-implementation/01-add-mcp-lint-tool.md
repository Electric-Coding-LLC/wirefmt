# Add MCP Lint Tool

[Back to Execution Map](../EXECMAP.md)

## Goal

Expose lint through MCP so agents can run the same core validation workflow
without dropping to the shell.

## Tasks

- Add a `wirefmt.lint` MCP tool.
- Reuse the shared core lint engine rather than duplicating analysis logic.
- Return structured findings suitable for agent consumption.

## Exit Criteria

- `wirefmt.lint` is registered and callable through the MCP server.
- Findings reflect the same underlying issue codes as the CLI.
