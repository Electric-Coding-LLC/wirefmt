# Execution Map

## Goal

Ship `v0.7` as a bounded three-box release by supporting exactly three
horizontal sibling boxes when all boxes share the same row structure and each
gap is one to three literal space columns.

## Guardrails

- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Keep scope to exactly three sibling boxes in one block with one to three
  literal space columns between adjacent boxes.
- Reuse the same conservative contract from `v0.6`: unsupported layouts still
  pass through unchanged with stable diagnostics.
- Do not add four-plus sibling boxes, staggered rows, nested boxes,
  interior-border rows, or general column-grid support.

## Execution Map

- [x] Define the exact three-box support contract and the unsupported boundary.
- [x] Extend the shared core so format and lint both support exactly three
  sibling boxes without changing the two-box behavior.
- [x] Add targeted fixtures and CLI/MCP parity coverage for supported and
  unsupported three-box layouts.
- [x] Update README and MCP docs so `v0.7` is documented as an exact
  three-sibling-box release.
- [ ] Prepare the `v0.7` release.

## Done When

- Exactly three sibling boxes with one to three literal spaces between adjacent
  boxes format and lint consistently across the shared core, CLI, and MCP
  surfaces.
- Supported three-box layouts preserve the observed gap widths while each box
  still normalizes independently.
- Four-plus sibling boxes, staggered three-box layouts, and broader
  multi-column shapes remain conservative unsupported cases.
- Tests and docs describe `v0.7` as a bounded three-box release rather than a
  general layout-intelligence expansion.
