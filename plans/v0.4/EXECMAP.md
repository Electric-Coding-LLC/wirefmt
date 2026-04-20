# Execution Map

## Goal

Ship `v0.4` as the first narrow layout-expansion release by supporting one
clearly defined adjacent sibling box shape without broadening `wirefmt` into a
general multi-box formatter.

## Guardrails

- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Keep scope to one supported adjacent sibling box shape in one block.
- Do not add nested-box, interior-border-row, or general ASCII art support.
- Avoid guessing ambiguous layouts; unsupported shapes should still pass
  through unchanged with stable diagnostics.

## Execution Map

- [x] [Define supported multi-box scope](./01-define-supported-multi-box-scope.md)
- [x] [Define adjacent-box contracts](./02-define-adjacent-box-contracts.md)
- [x] [Implement adjacent sibling box support](./03-implement-adjacent-sibling-box-support.md)
- [x] [Verify supported and unsupported layout behavior](./04-verify-supported-and-unsupported-layout-behavior.md)
- [x] [Prepare v0.4 release](./05-prepare-v0.4-release.md)

## Done When

- One documented adjacent sibling box shape formats and lints consistently
  across the shared core, CLI, and MCP surfaces.
- Unsupported multi-box layouts outside the `v0.4` scope still remain
  conservative: unchanged formatting plus stable warnings or issues.
- Tests, docs, and release notes describe `v0.4` as a bounded adjacent-box
  release rather than a general layout-intelligence expansion.
