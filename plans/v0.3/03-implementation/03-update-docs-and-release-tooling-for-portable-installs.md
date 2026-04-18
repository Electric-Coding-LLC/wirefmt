# Update Docs And Release Tooling For Portable Installs

[Back to Plan](../PLAN.md)

## Goal

Bring docs and release tooling into line with the `v0.3` portability contract.

## Tasks

- Update `README.md` to distinguish:
  - Bun-based contributor setup in the repo
  - Node-based installed-package use for end users
- Update MCP docs to show `wirefmt-mcp` as the default installed-entrypoint
  flow, with local Bun-launched checkout instructions retained only as a repo
  development path.
- Update release docs so the primary smoke-test path installs the packed
  tarball through a normal Node package flow.
- Update CI and release-tooling smoke tests so they verify the packaged Node
  entrypoints instead of assuming Bun-backed installed binaries.

## Guardrails

- Keep the messaging centered on one small product.
- Do not imply broader formatter scope as part of the runtime portability
  release.
- Keep contributor Bun workflow documented where it still matters.
- Keep the docs honest about prerequisites:
  - Bun for maintainers
  - Node for installed-package users

## Exit Criteria

- Docs describe the same install and launch story as the packaged artifacts.
- Release tooling verifies the documented package shape.
- The documented default install path no longer depends on Bun.
- The release narrative stays centered on adoption friction reduction.
