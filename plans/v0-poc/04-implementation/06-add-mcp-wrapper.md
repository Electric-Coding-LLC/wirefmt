# Add MCP Wrapper

[Back to Plan](../PLAN.md)

## Goal

Expose the formatter to agents without duplicating logic.

## Tasks

- Add an MCP server or MCP-compatible wrapper.
- Map MCP inputs directly to the core formatter.
- Return formatted text and structured errors.
- Reuse existing validation and formatting code.

## Exit Criteria

- The MCP path and CLI path share the same core engine.
- Agent calls produce the same output as CLI calls for the same input.
- Wrapper code stays thin.
