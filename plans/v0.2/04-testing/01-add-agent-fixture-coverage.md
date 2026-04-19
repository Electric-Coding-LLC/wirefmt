# Add Agent Fixture Coverage

[Back to Execution Map](../EXECMAP.md)

## Goal

Test `wirefmt` against messy inputs that resemble real agent or human output,
not just idealized box samples.

## Tasks

- Add representative malformed box fixtures.
- Add samples with uneven spacing and partial structure.
- Cover conservative pass-through behavior for unsupported layouts.

## Exit Criteria

- Test coverage includes realistic ugly inputs.
- Added fixtures strengthen confidence without widening supported scope.
