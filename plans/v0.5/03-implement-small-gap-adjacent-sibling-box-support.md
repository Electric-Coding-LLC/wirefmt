# Implement small-gap adjacent sibling box support

[Back to Execution Map](./EXECMAP.md)

## Goal

Implement the bounded small-gap adjacent sibling box support defined for
`v0.5` in the shared core so the existing CLI and MCP surfaces pick it up
automatically.

## Tasks

- Update analysis and formatting logic to recognize the supported two-box
  frame with one-, two-, or three-space gaps and render it consistently.
- Preserve supported observed gaps while keeping wider-gap or otherwise
  unsupported multi-box inputs on the conservative fallback path.
- Make any narrow documentation or fixture updates needed to reflect the new
  supported shape during implementation.

## Constraints

- Reuse the shared core engine instead of introducing split behavior across
  CLI and MCP.
- Avoid a broad parser or architecture rewrite unless it is strictly required
  for the chosen shape.

## Exit Criteria

- Supported small-gap adjacent sibling boxes work through the shared core and
  surface correctly through CLI and MCP.
- Existing single-box behavior stays intact for previously supported inputs.

<!-- Track completion in EXECMAP.md, not in this file. -->
