# Execution Map

## Goal

Ship `v0.8` as a bounded compound-box release by supporting a single outer box
with full-width interior border rows that separate stacked content panels.

## Guardrails

- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Keep scope to one single outer box with full-width interior divider rows and
  normal content rows between them.
- Preserve the conservative contract: unsupported layouts still pass through
  unchanged with stable diagnostics.
- Do not add nested boxes, multi-column grids, partial-width dividers, or
  broader table-like formatting.

## Execution Map

- [x] Define the exact compound single-box panel contract and unsupported
  boundary.
- [x] Extend the shared core so format and lint both support full-width
  interior divider rows inside one box.
- [x] Add targeted fixtures and CLI/MCP parity coverage for supported and
  unsupported compound-panel layouts.
- [x] Update README and MCP docs so `v0.8` is documented as a bounded
  compound-box release.
- [ ] Prepare the `v0.8` release.

## Done When

- A single box with full-width interior divider rows formats and lints
  consistently across the shared core, CLI, and MCP surfaces.
- Supported compound boxes preserve divider rows while normalizing content to
  one stable width.
- Empty panels, partial-width divider rows, nested boxes, and broader layouts
  remain conservative unsupported cases.
- Tests and docs describe `v0.8` as a bounded compound-box release rather than
  a general interior-structure engine.
