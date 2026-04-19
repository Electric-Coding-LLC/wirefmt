# Execution Map

## Goal

Ship `v0.2` as a focused product release that makes `wirefmt` feel complete
for agent use through CLI and MCP parity.

## Guardrails

- Keep the shipped surface to one small product backed by the same conservative
  box engine.
- Keep the CLI surface to `wirefmt format` and `wirefmt lint`.
- Keep the MCP surface to `wirefmt.format` and `wirefmt.lint`.
- Do not broaden the work into smarter multi-box interpretation, general ASCII
  art formatting, or larger platform ambitions.

## Execution Map

- [x] [Define release scope](01-scope/01-define-release-scope.md)
- [x] [Define agent tool surface](02-product-and-contracts/01-define-agent-tool-surface.md)
- [x] [Define result contracts](02-product-and-contracts/02-define-result-contracts.md)
- [x] [Add MCP lint tool](03-implementation/01-add-mcp-lint-tool.md)
- [x] [Align CLI and MCP output](03-implementation/02-align-cli-and-mcp-output.md)
- [x] [Polish agent setup docs](03-implementation/03-polish-agent-setup-docs.md)
- [x] [Add agent fixture coverage](04-testing/01-add-agent-fixture-coverage.md)
- [x] [Verify CLI and MCP parity](04-testing/02-verify-cli-and-mcp-parity.md)
- [x] [Prepare v0.2 release](05-release/01-prepare-v0.2-release.md)

## Done When

- `wirefmt.format` and `wirefmt.lint` are both available through MCP.
- CLI and MCP expose aligned behavior and stable issue meanings.
- Agent-facing docs describe a clean install-and-connect flow.
