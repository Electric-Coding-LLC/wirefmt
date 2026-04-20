# Execution Map

## Goal

Ship `v0.5.1` as a trust-repair patch by making CLI `format` surface
conservative formatter warnings instead of silently returning unchanged
unsupported layouts.

## Guardrails

- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Do not broaden supported layout scope in this patch.
- Keep unsupported layouts conservative: preserve original text and surface
  stable warnings rather than attempting repair.
- Do not run release, publish, or tag commands as part of this slice.

## Execution Map

- [x] Make CLI `format` report formatter warnings consistently with the current
  documented contract.
- [x] Add targeted tests covering unchanged unsupported layouts and warning
  emission behavior.
- [x] Verify the local gate and leave the repo ready for the manual patch
  release flow.

## Done When

- CLI `format` writes the formatted or unchanged text to stdout and reports any
  formatter warnings to stderr without turning conservative pass-through into an
  operational failure.
- MCP and CLI describe the same warning behavior for unsupported or ambiguous
  layouts.
- The standard local verification gate passes and the repo accurately tracks
  `v0.5.1` as the active patch slice.
