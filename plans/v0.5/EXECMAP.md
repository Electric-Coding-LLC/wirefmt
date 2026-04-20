# Execution Map

## Goal

Ship `v0.5` as a bounded two-box tolerance release by supporting exactly two
horizontal sibling boxes when they share the same row structure and are
separated by a small consistent space gap.

## Guardrails

- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Keep scope to exactly two sibling boxes in one block with a gap of one to
  three literal space columns.
- Preserve the observed gap width for supported layouts instead of inventing a
  new spacing rule.
- Do not add three-box, staggered-height, nested-box, interior-border-row, or
  general column-layout support.
- Avoid guessing ambiguous layouts; unsupported shapes should still pass
  through unchanged with stable diagnostics.

## Execution Map

- [x] [Define bounded gap-tolerance scope](./01-define-bounded-gap-tolerance-scope.md)
- [x] [Define gap-preserving adjacent-box contracts](./02-define-gap-preserving-adjacent-box-contracts.md)
- [x] [Implement small-gap adjacent sibling box support](./03-implement-small-gap-adjacent-sibling-box-support.md)
- [x] [Verify supported and unsupported gap behavior](./04-verify-supported-and-unsupported-gap-behavior.md)
- [x] [Prepare v0.5 release](./05-prepare-v0.5-release.md)

## Done When

- Exactly two sibling boxes with a consistent one-, two-, or three-space gap
  format and lint consistently across the shared core, CLI, and MCP surfaces.
- Supported two-box layouts preserve their observed gap width while each box
  still normalizes independently.
- Wider-gap layouts, three-plus boxes, staggered boxes, and other broader
  multi-column shapes remain conservative unsupported cases.
- Tests, docs, and release notes describe `v0.5` as a bounded gap-tolerance
  release rather than a general layout-intelligence expansion.
