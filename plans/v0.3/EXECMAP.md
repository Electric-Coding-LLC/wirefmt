# Execution Map

## Goal

Ship `v0.3` as a narrow portability release that makes the shipped CLI and MCP
entrypoints easier to install and run.

## Guardrails

- Keep the conservative single-box formatter behavior unchanged.
- Keep the shipped CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the shipped MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Keep the work centered on packaging and install reliability rather than
  broader layout ambition.

## Execution Map

- [x] [Define release scope](01-scope/01-define-release-scope.md)
- [x] [Define runtime and distribution surface](02-product-and-contracts/01-define-runtime-and-distribution-surface.md)
- [x] [Define install and launch contract](02-product-and-contracts/02-define-install-and-launch-contract.md)
- [x] [Decouple shipped entrypoints from Bun-only launch](03-implementation/01-decouple-shipped-entrypoints-from-bun-only-launch.md)
- [x] [Package CLI and MCP binaries for portable install](03-implementation/02-package-cli-and-mcp-binaries-for-portable-install.md)
- [x] [Update docs and release tooling for portable installs](03-implementation/03-update-docs-and-release-tooling-for-portable-installs.md)
- [x] [Add installed-package smoke tests](04-testing/01-add-installed-package-smoke-tests.md)
- [x] [Verify CLI and MCP launch flows](04-testing/02-verify-cli-and-mcp-launch-flows.md)
- [ ] [Prepare v0.3 release](05-release/01-prepare-v0.3-release.md)

## Done When

- Installed users can run the packaged `wirefmt` CLI without Bun as the
  required end-user runtime.
- MCP clients can launch the shipped `wirefmt-mcp` entrypoint from the
  published package.
- Docs, packaging, and verification all describe the same install path.
