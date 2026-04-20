# Prepare v0.4 release

[Back to Execution Map](./EXECMAP.md)

## Goal

Prepare `v0.4` as a coherent release that advertises one bounded layout
improvement and keeps the rest of the product story conservative.

## Release Message

`wirefmt v0.4 adds bounded adjacent sibling box support while keeping the install/runtime story and conservative product boundary from v0.3.`

## Verification Notes

- `bun run check` passes after the adjacent sibling box implementation.
- Engine, ugly-input fixture, and CLI/MCP parity coverage now separate the
  supported one-space sibling-box frame from still-unsupported wider-gap
  multi-box layouts.
- The public docs keep the runtime story from `v0.3`: installed users still
  use Node, and contributors still use Bun.

## Tasks

- Update release notes and docs to describe the supported adjacent sibling box
  shape and its explicit non-goals.
- Confirm the release story still reads as one small product improvement on top
  of the `v0.3` install and runtime contract.
- Record the verification evidence needed to ship the release with confidence.

## Constraints

- Keep the message centered on bounded adjacent-box support, not general
  layout intelligence.
- Preserve the `v0.3` Node-installed runtime story; this release is about
  layout support, not packaging changes.

## Exit Criteria

- The `v0.4` release message is clear in one sentence.
- Docs, tests, and release verification all describe the same bounded
  adjacent-box contract.

<!-- Track completion in EXECMAP.md, not in this file. -->
