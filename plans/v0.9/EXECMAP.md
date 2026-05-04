# Execution Map

## Goal

Ship `v0.9` as a deterministic prompt-export release by turning supported
ASCII layout sketches into stable JSON and plain-English layout descriptions.

## Guardrails

- Keep `wirefmt` deterministic: no image generation calls, no stochastic prompt
  wording, and no guessing for unsupported layouts.
- Support only the shapes already handled by `format`: single boxes, exactly two
  or three horizontal sibling boxes, and compound single-box panels.
- Keep CLI and MCP behavior aligned through one shared core.
- Preserve the conservative contract: unsupported layouts return diagnostics
  instead of invented descriptions.
- Do not broaden the formatter's layout support as part of this release.

## Execution Map

- [x] Promote the `v0.9` prompt-export slice into `ROADMAP.md`, `PLAN.md`, and
  this execution map.
- [x] Define the deterministic describe result contract for supported and
  unsupported layouts.
- [x] Implement the shared describe core plus `wirefmt describe`.
- [x] Add MCP `wirefmt.describe` with parity to the CLI behavior.
- [x] Add targeted tests and docs for JSON and plain-English prompt output.
- [x] Run cleanup, review, and delivery checks for the slice.

## Done When

- Supported layouts produce stable JSON with shape type, content labels, and
  layout relationships.
- Supported layouts produce stable plain-English prompt scaffolds suitable for
  image-generation prompts.
- Unsupported layouts return deterministic diagnostics without invented layout
  descriptions.
- CLI and MCP describe behavior share one core implementation and have parity
  coverage.
- Docs explain describe as a layout-intent export, not image generation.
