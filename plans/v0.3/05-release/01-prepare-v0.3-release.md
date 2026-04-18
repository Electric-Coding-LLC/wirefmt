# Prepare v0.3 Release

[Back to Plan](../PLAN.md)

## Goal

Ship `v0.3` as the release that makes `wirefmt` easier to install and launch
without changing the conservative formatting product boundary.

## Release Message

`wirefmt v0.3 makes the shipped CLI and MCP entrypoints easier to install and run, while keeping the same small conservative box engine.`

## Release Story Guardrails

- Keep the release centered on runtime portability and adoption friction.
- CLI stays:
  - `wirefmt format`
  - `wirefmt lint`
- MCP stays:
  - `wirefmt.format`
  - `wirefmt.lint`
- Do not broaden the story around smarter layout interpretation or larger ASCII
  art ambitions.

## Tasks

- Update release notes and docs to reflect the `v0.3` portability theme.
- Verify the published package shape matches the documented install contract.
- Confirm the release still reads as one small product improvement.

## Exit Criteria

- The release message is clear in one sentence.
- Shipped artifacts and docs match the `v0.3` install and launch contract.
- The release remains adoption-focused rather than scope-expanding.
