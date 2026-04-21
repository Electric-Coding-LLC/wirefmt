# Roadmap

This file is the durable version-level control document after shipped `0.5.1`.
`CHANGELOG.md` is shipped history, `PLAN.md` points at the active execution
slice, and versioned `plans/*/EXECMAP.md` files track committed work once a
version is promoted.

## How It Fits

- `ROADMAP.md` tracks version order, scope, and minimal lifecycle state.
- `PLAN.md` points at the one active promoted version.
- `plans/*/EXECMAP.md` tracks detailed execution state for that active version.

That means:

- roadmap entries do not belong in `PLAN.md`
- roadmap entries do not get checkbox execution state
- only one version may be active at a time
- a roadmap version becomes executable work only after promotion into
  `plans/<version>/EXECMAP.md`

## Status Model

Each version carries one `Status:` line directly under the version heading.

Supported values:

- `planned`
- `active`
- `completed`
- `blocked`

Rules:

- the roadmap stays ordered
- the next version is the first one that is not `completed`
- add `Execmap:` only after the version is promoted
- keep step-level status in the promoted `EXECMAP.md`, not here
- roadmap completion is internal completion after merge, not public publish

## Product Direction

- Keep `wirefmt` conservative: normalize only clearly defined box shapes and
  preserve unsupported layouts unchanged.
- Keep CLI and MCP behavior aligned through one shared core.
- Expand support by one bounded shape family at a time.
- Improve diagnostics before or alongside broader layout support.
- Do not turn `wirefmt` into a general-purpose ASCII art formatter.

## Current Baseline

- Shipped baseline: `0.5.1`.
- Supported formatting: single boxes plus exactly two horizontal sibling boxes
  with one to three literal space columns and matching row structure.
- Current conservative gaps: three-plus sibling boxes, staggered siblings,
  wider column layouts, interior border rows, and text outside the detected
  box.

## Version Horizon

### v0.6: Specific Conservative Diagnostics
Status: active
Execmap: `plans/v0.6/EXECMAP.md`

- Replace generic conservative warnings with stable reasons for common
  unsupported cases such as three-plus sibling boxes, over-wide gaps,
  staggered rows, interior border rows, and text outside the detected box.
- Keep formatting behavior unchanged for unsupported layouts: pass through the
  original text, but explain why the block stayed conservative.
- Update CLI, MCP, docs, and tests so the diagnostic contract is explicit.

### v0.7: Exactly Three Horizontal Sibling Boxes
Status: planned

- Support exactly three adjacent sibling boxes in one block when all boxes
  share the same row structure and each gap is one to three literal spaces.
- Keep each box independently normalized while preserving the observed gaps.
- Continue rejecting staggered, nested, or broader grid-like layouts.

### v0.8: First Compound Single-Box Panels
Status: planned

- Support a single box that contains full-width interior border rows separating
  stacked panels.
- Keep scope to one bounded compound-box shape rather than opening general
  nested-box or table formatting.
- Reuse the same conservative contract: supported shapes normalize, unsupported
  shapes pass through unchanged with stable diagnostics.

## Hold The Line

- No general-purpose ASCII art formatting.
- No guessing author intent for ambiguous borders.
- No broad row-and-column grid engine until the bounded release slices above
  prove stable.

## Selection Rule

Only one roadmap item should become an active initiative at a time. When that
happens:

1. create `plans/<version>/EXECMAP.md`
2. change that version to `Status: active`
3. add `Execmap: plans/<version>/EXECMAP.md`
4. point `PLAN.md` at that initiative
5. keep concrete step status in the promoted `EXECMAP.md`
6. change the roadmap entry to `Status: completed` only after the work is merged
