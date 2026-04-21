# Execution Map

## Goal

Ship `v0.6` as a diagnostic-clarity release by replacing generic conservative
unsupported-layout feedback with stable, actionable reasons while keeping
formatting behavior unchanged.

## Guardrails

- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Do not broaden supported layout scope in this slice.
- Preserve the conservative formatter contract: unsupported layouts still pass
  through unchanged.
- Keep warning and issue codes stable once documented.

## Execution Map

- [x] Define the stable conservative diagnostic taxonomy for the current
  unsupported layout families.
- [x] Thread the new warnings and lint issues through the shared core, CLI, and
  MCP surfaces without changing pass-through behavior.
- [x] Add targeted fixtures and parity coverage for the documented unsupported
  cases.
- [x] Update README and MCP docs so the diagnostic contract is explicit.
- [ ] Prepare the `v0.6` release.

## Done When

- Unsupported layout findings distinguish the main conservative failure modes
  instead of collapsing into one generic multi-box warning.
- CLI and MCP report the same diagnostic codes and messages for the same
  inputs.
- Formatting results for unsupported layouts stay unchanged apart from the more
  specific diagnostics.
- Tests and docs describe `v0.6` as a diagnostic-clarity release, not a layout
  expansion release.
