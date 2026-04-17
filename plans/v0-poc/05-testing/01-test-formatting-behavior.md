# Test Formatting Behavior

[Back to Plan](../PLAN.md)

## Goal

Prove that `wirefmt` produces stable, conservative output across common messy inputs.

## Test Areas

- Single-box normalization.
- Missing or broken border repair.
- Inner padding behavior.
- Width calculation behavior with and without `--width`.
- `stdin` and file input parity.
- Passthrough behavior for unsupported text.

## Exit Criteria

- Golden tests cover representative examples.
- Output is byte-for-byte deterministic.
- Regression coverage exists for the example in the project brief.
