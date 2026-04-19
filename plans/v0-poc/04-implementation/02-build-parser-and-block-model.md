# Build Parser And Block Model

[Back to Execution Map](../EXECMAP.md)

## Goal

Represent input in a way that supports conservative formatting without a full layout engine.

## Tasks

- Read raw input into a line-preserving model.
- Split content into blocks separated by blank lines.
- Define a small block representation for candidate wireframe regions and passthrough text.
- Preserve source ordering and original blank lines.

## Exit Criteria

- Input parsing is deterministic.
- The model supports both formatting and linting.
- Unsupported blocks can be carried through unchanged.
