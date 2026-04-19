# Prepare v0.2 Release

[Back to Execution Map](../EXECMAP.md)

## Goal

Ship `v0.2` as a coherent follow-on release to `v0-poc`, centered on agent-ready
parity rather than broader formatter ambition.

## Release Message

`wirefmt v0.2 makes formatting and linting available through matching CLI and MCP surfaces backed by one conservative box engine.`

## Release Story Guardrails

- Keep the shipped surface to one small product.
- CLI: `wirefmt format`, `wirefmt lint`
- MCP: `wirefmt.format`, `wirefmt.lint`
- Keep the implementation grounded in the same shared core behavior and stable
  issue codes.
- Do not broaden the release around smarter multi-box interpretation or general
  ASCII art support.

## Tasks

- Update release notes and docs to reflect the `v0.2` theme.
- Verify the packaged artifacts expose the intended CLI and MCP surfaces.
- Confirm the release story is still small and coherent.

## Verification Notes

- `README.md`, `docs/release.md`, and `docs/mcp.md` now describe the same
  `v0.2` agent-ready parity story.
- The packaged-release helper verifies both shipped executables from a clean
  temp install before creating a release commit or tag.
- The tarball smoke test now checks the documented CLI surface and MCP tool
  list, then calls both `wirefmt.format` and `wirefmt.lint` through the
  installed server.

## Exit Criteria

- The release message is clear in one sentence.
- Shipped artifacts and docs match the `v0.2` contract.
