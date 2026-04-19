# Define Release Scope

[Back to Execution Map](../EXECMAP.md)

## Goal

Define the smallest useful `v0-poc` release of `wirefmt` and lock the non-goals.

## In Scope

- Format rough ASCII UI wireframes composed of boxes, text, and simple layout structure.
- Read input from a file or `stdin`.
- Produce deterministic output.
- Normalize obvious box borders and align vertical edges.
- Apply consistent inner padding.
- Preserve original order, grouping, and intent.
- Support `wirefmt format <file>` and `wirefmt format` from `stdin`.
- Support `--width` and `--pad`.

## Optional For `v0-poc`

- `wirefmt lint <file>` issue reporting.
- MCP wrapper around the same formatter core.

## Out Of Scope

- Redesigning layouts.
- Reordering content.
- Inventing new UI elements.
- Styling beyond spacing and alignment.
- General-purpose ASCII art formatting.
- Complex nested layout intelligence or absolute positioning.

## Exit Criteria

- The `v0-poc` release definition fits in one sentence.
- Optional and later-phase features are explicit.
- Non-goals are documented and stable enough to guide implementation.
