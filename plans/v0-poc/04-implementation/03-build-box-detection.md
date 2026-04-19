# Build Box Detection

[Back to Execution Map](../EXECMAP.md)

## Goal

Identify when a block is intended to be a rectangular ASCII wireframe box.

## Tasks

- Detect top and bottom border candidates.
- Detect side-edge intent from `|` placement.
- Measure content width requirements from interior text.
- Reject ambiguous layouts instead of forcing a rewrite.

## Exit Criteria

- Known valid examples are detected reliably.
- Clearly ambiguous blocks are rejected safely.
- Detection decisions are covered by tests.
