# Plan

This `v0.3` release will be completed by working through these steps in order.

## Scope

| Step | Started | Completed |
| --- | --- | --- |
| [01-define-release-scope](01-scope/01-define-release-scope.md) | 2026-04-18 | 2026-04-18 |

## Product And Contracts

| Step | Started | Completed |
| --- | --- | --- |
| [01-define-runtime-and-distribution-surface](02-product-and-contracts/01-define-runtime-and-distribution-surface.md) | 2026-04-18 | 2026-04-18 |
| [02-define-install-and-launch-contract](02-product-and-contracts/02-define-install-and-launch-contract.md) | 2026-04-18 | 2026-04-18 |

## Implementation

| Step | Started | Completed |
| --- | --- | --- |
| [01-decouple-shipped-entrypoints-from-bun-only-launch](03-implementation/01-decouple-shipped-entrypoints-from-bun-only-launch.md) | 2026-04-18 | 2026-04-18 |
| [02-package-cli-and-mcp-binaries-for-portable-install](03-implementation/02-package-cli-and-mcp-binaries-for-portable-install.md) | 2026-04-18 | 2026-04-18 |
| [03-update-docs-and-release-tooling-for-portable-installs](03-implementation/03-update-docs-and-release-tooling-for-portable-installs.md) | 2026-04-18 | 2026-04-18 |

## Testing

| Step | Started | Completed |
| --- | --- | --- |
| [01-add-installed-package-smoke-tests](04-testing/01-add-installed-package-smoke-tests.md) | 2026-04-18 | 2026-04-18 |
| [02-verify-cli-and-mcp-launch-flows](04-testing/02-verify-cli-and-mcp-launch-flows.md) | 2026-04-18 | 2026-04-18 |

## Release

| Step | Started | Completed |
| --- | --- | --- |
| [01-prepare-v0.3-release](05-release/01-prepare-v0.3-release.md) |  |  |

## Notes

- `v0.2` completed the agent-ready parity line for CLI and MCP.
- `v0.3` is aimed at making the shipped package easier to install and run.
- Theme: remove avoidable adoption friction before broadening layout scope.
- Scope and product-contract planning for `v0.3` are complete.
- Phase 3 implementation is complete:
  - shipped `bin/` wrappers are Node-launched
  - published runtime now comes from bundled `dist/`
  - installed CLI file reads no longer depend on `Bun.file`
- Phase 4 testing work is complete:
  - CI and release flows now smoke-test an npm-installed tarball
  - shared packed-install verification covers CLI, MCP, and package layout
- Release preparation is the remaining open workstream for `v0.3`.
