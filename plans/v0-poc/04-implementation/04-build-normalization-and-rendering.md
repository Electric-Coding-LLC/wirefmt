# Build Normalization And Rendering

[Back to Execution Map](../EXECMAP.md)

## Goal

Turn detected box blocks into clean, aligned output while preserving user intent.

## Tasks

- Normalize border width and corner characters.
- Normalize each content line to a stable inner width.
- Apply configurable left and right padding.
- Align vertical edges consistently across the block.
- Preserve content text and blank lines.

## Exit Criteria

- Formatting output is deterministic.
- The rendered output matches the intended box structure.
- Border repair is conservative and predictable.
