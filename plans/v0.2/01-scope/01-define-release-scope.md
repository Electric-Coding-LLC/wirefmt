# Define Release Scope

[Back to Execution Map](../EXECMAP.md)

## Goal

Define a focused `v0.2` release that turns `wirefmt` from a formatter POC into
a cleaner agent-facing tool.

## Release Theme

Agent-ready parity.

## Release Goal

Ship `wirefmt` as a small, reliable ASCII box tool with first-class CLI and MCP
support for the same core workflows.

## Starting Point

- `v0-poc` shipped the formatter core, CLI, docs, tests, release flow, and MCP
  formatting integration.
- The biggest product gap is interface split: formatting is available through
  CLI and MCP, while lint is CLI-only.
- The next release should improve product coherence rather than broaden layout
  ambition.

## In Scope

- Add `wirefmt.lint` to the MCP server.
- Define stable result shapes for formatting and linting across CLI and MCP.
- Keep the CLI and MCP backed by the same shared core behavior and issue codes.
- Improve agent-facing setup and usage docs for Codex and similar MCP clients.
- Add tests using realistic malformed and agent-generated box inputs.

## Optional

- Small CLI or docs polish needed to preserve parity or clarify usage.
- Minor naming cleanup if it improves result clarity without changing the core
  product promise.

## Out Of Scope

- Smarter layout interpretation for multiple adjacent boxes or nested layouts.
- Guessing user intent for ambiguous diagrams.
- Turning `wirefmt` into a general-purpose ASCII art formatter.
- Major platform/distribution expansion beyond what already ships.
- Large UI or hosted-service ambitions.

## Exit Criteria

- `wirefmt.format` and `wirefmt.lint` are both available through MCP.
- CLI and MCP expose the same issue codes and meaningfully aligned behavior.
- Docs show a clean install-and-connect flow for agent usage.
- The release remains narrow and coherent under the agent-ready parity theme.
