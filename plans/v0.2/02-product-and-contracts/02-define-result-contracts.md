# Define Result Contracts

[Back to Execution Map](../EXECMAP.md)

## Goal

Define the `v0.2` result contracts so formatter and lint outputs are stable
enough for downstream agents and still readable in the CLI.

## Current State

### Shared core types

- `FormatResult`
  - `formattedText: string`
  - `changed: boolean`
  - `warnings: { code: string; message: string }[]`
- `LintResult`
  - `issues: { code; message; source; lineOrBlock }[]`

### Current interface split

- CLI format prints `formattedText`.
- CLI lint prints one text line per issue and uses exit code `1` when findings
  exist.
- MCP format returns structured content with:
  - `formattedText`
  - `changed`
  - `warnings?`
- MCP has no lint contract yet.

## `v0.2` Contract Decisions

### Stable issue codes

The following lint issue codes are part of the `v0.2` contract:

- `ambiguous-box`
- `broken-border`
- `misaligned-edge`
- `uneven-width`
- `unsupported-layout`

These codes should be treated as stable identifiers for agent integrations in
`v0.2`.

### Format contract

Shared semantic contract:

- `formattedText: string`
  - The rendered or unchanged output text.
- `changed: boolean`
  - Whether formatting changed the original input text.
- `warnings?: { code: string; message: string }[]`
  - Omitted when there are no warnings.

MCP `wirefmt.format` should expose this structure directly.

CLI `format` does not need to print JSON in `v0.2`; it may continue printing
only `formattedText`, but its behavior must remain consistent with the same
underlying fields.

### Lint contract

Shared semantic contract:

- `issues: LintIssue[]`

Where each `LintIssue` contains:

- `code: LintIssueCode`
- `message: string`
- `source: string`
- `lineOrBlock: string`

MCP `wirefmt.lint` should expose `issues` as structured content.

CLI `lint` may continue printing human-readable lines in this form:

```text
<source>:<line-or-block>: <code> <message>
```

but those lines must serialize the same fields that MCP returns structurally.

## Field placement rules

- `changed` belongs only to formatting.
- `warnings` belong only to formatting.
- `issues` belong only to linting.
- `source` and `lineOrBlock` belong on each lint issue, not at the top level.

## Interface-specific behavior that remains acceptable

- CLI keeps exit codes:
  - `0` for successful format or lint with no issues
  - `1` for lint findings
  - `2` for usage or runtime failure
- CLI remains text-first rather than JSON-first.
- MCP remains structured-content-first even if it also includes text content for
  client compatibility.

## Non-Goals For `v0.2`

- Do not introduce multiple alternative result shapes for the same workflow.
- Do not add severity levels or categories unless they are grounded in real
  product need.
- Do not promise richer positional metadata than `lineOrBlock` in `v0.2`.

## Exit Criteria

- Formatting and linting each have one named contract.
- MCP can expose both workflows structurally.
- CLI output can be explained as a rendering of the same underlying fields.
- The stable `v0.2` issue-code set is explicit.
