# Define Agent Tool Surface

[Back to Plan](../PLAN.md)

## Goal

Define the `v0.2` agent-facing surface so `wirefmt` behaves like one small
product across CLI and MCP.

## Current State

- CLI commands:
  - `wirefmt format [file] [--width <number>] [--pad <number>]`
  - `wirefmt lint [file] [--width <number>] [--pad <number>]`
- Current MCP tool:
  - `wirefmt.format`
- Current gap:
  - lint requires shell fallback even though the shared core already exposes
    structured issues

## Decisions

### MCP tools in `v0.2`

- `wirefmt.format`
- `wirefmt.lint`

These are the only first-class MCP tools for `v0.2`.

## Core workflows that must not require shell fallback

- Format a single-box ASCII wireframe block or a document containing supported
  wireframe blocks.
- Lint the same input and return structured findings.
- Surface conservative warnings or unsupported-layout findings without
  inventing repairs.

## Interface responsibilities

### CLI

- Remains the human and script interface.
- Keeps text output and exit codes optimized for terminal use.
- Continues to support file-path input or `stdin`.

### MCP

- Becomes the agent-native interface for both formatting and linting.
- Returns structured content suitable for direct tool use.
- Uses the same shared formatter and lint engine as the CLI.

## Option parity

### Format

- Shared options:
  - `text`
  - `width`
  - `pad`
- CLI keeps `[file]` or `stdin` input semantics.
- MCP accepts the raw `text` payload directly.

### Lint

- Required shared input:
  - `text`
- MCP lint should also accept:
  - `source` optional, defaulting to `<stdin>` when omitted
- `width` and `pad` are not part of the lint contract in `v0.2`.
- CLI may keep accepting `--width` and `--pad` for backward CLI surface
  compatibility, but they should remain documented as ignored by lint.

## Conservative behavior boundaries

- `wirefmt` stays limited to simple single-box layouts.
- Unsupported or ambiguous layouts must not trigger guessed repairs.
- Formatting preserves unsupported input and may emit warnings.
- Lint reports issue codes rather than attempting repair.
- MCP should not expose tools that imply broader diagram understanding than the
  shared core actually supports.

## `v0.2` Tool Surface Summary

### CLI

- `wirefmt format`
- `wirefmt lint`

### MCP

- `wirefmt.format`
- `wirefmt.lint`

## Exit Criteria

- The `v0.2` tool list is explicit.
- Agents can format and lint without shell fallback.
- CLI and MCP responsibilities are clear and non-overlapping.
- The product surface remains narrow enough to match current scope and tests.
