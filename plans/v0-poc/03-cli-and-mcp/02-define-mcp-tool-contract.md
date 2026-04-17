# Define MCP Tool Contract

[Back to Plan](../PLAN.md)

## Goal

Expose the formatter through MCP without creating a second formatting implementation.

## Proposed Tool Shape

- Tool name: `wirefmt.format`
- Input:
  - `text`
  - optional `width` as target outer width
  - optional `pad` as inner horizontal padding per side
- Output:
  - `formattedText`
  - `changed`
  - optional `warnings`

## Principles

- The MCP layer calls the same core formatter used by the CLI.
- MCP output remains deterministic and text-first.
- Errors are structured and actionable.
- `v0-poc` exposes formatting only through MCP.
- If lint is exposed later, it should be a separate thin tool built on the same analysis engine.

## Error Shape

- Errors return a stable `code` and short `message`.
- Unsupported or ambiguous blocks are not fatal formatting errors; they are returned unchanged and may produce warnings.

## Exit Criteria

- The MCP contract mirrors the CLI behavior closely.
- There is only one core formatting engine.
- Tool I/O is stable enough for agent usage.
