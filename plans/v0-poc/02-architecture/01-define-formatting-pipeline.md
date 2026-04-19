# Define Formatting Pipeline

[Back to Execution Map](../EXECMAP.md)

## Goal

Specify the deterministic transformation pipeline from raw text to cleaned wireframe output.

## Proposed Pipeline

1. Read raw input as lines without altering ordering.
2. Split the input into blocks using blank lines while preserving separators.
3. Classify each block as box-like or passthrough.
4. Parse box-like blocks into border lines and content lines.
5. Compute normalized inner width from content and configured padding.
6. Repair borders and vertical edges conservatively.
7. Re-render the block with normalized spacing.
8. Join blocks with original blank-line boundaries.

## Design Constraints

- Deterministic for identical input and flags.
- Conservative when the parser is uncertain.
- No semantic reinterpretation of the content.
- Prefer minimal repair over aggressive normalization.

## Exit Criteria

- The pipeline is simple enough to test step-by-step.
- Each stage has a clear input and output.
- Passthrough behavior is defined for unsupported blocks.
