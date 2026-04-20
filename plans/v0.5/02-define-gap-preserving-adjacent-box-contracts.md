# Define gap-preserving adjacent-box contracts

[Back to Execution Map](./EXECMAP.md)

## Goal

Define how adjacent sibling boxes with small gaps are detected and how
`format` and `lint` should behave for the supported shape and nearby
unsupported variants.

## Contract Decision

Treat the supported `v0.5` shape as two independently normalizable boxes that
happen to share one block:

- The block must contain exactly two boxes on every nonblank row.
- The boxes must appear in the same order on every row, separated by the same
  one-, two-, or three-space gap on every row.
- The two boxes must start on the same top-border row and end on the same
  bottom-border row.
- Every interior row must belong to both boxes, so staggered heights remain
  unsupported.
- Text outside the outer left and right box edges is still out of scope.

Formatter behavior:

- `format` should split the block into left-box and right-box sub-blocks,
  normalize each box with the existing box formatter, and rejoin the rendered
  rows with the original observed gap width.
- `pad` applies to each box independently.
- If `width` is provided, it applies to each box independently rather than to
  the combined row width.
- If the block falls outside the supported two-box frame, `format` should keep
  the current conservative passthrough behavior with `unsupported-layout`.

Lint behavior:

- If the block matches the supported two-box frame, `lint` should report the
  existing structural issue codes from each box as needed:
  `broken-border`, `misaligned-edge`, and `uneven-width`.
- If the block falls outside the supported two-box frame, `lint` should keep
  reporting `unsupported-layout`.
- `v0.5` should not add new CLI flags, MCP tools, or multi-box-specific issue
  codes.

Acceptance examples:

Supported and normalized:

```text
+---+  +----+
| a |  | bb |
+---+  +----+
```

Supported frame, but malformed second box:

```text
+---+   +----+
| a |   | bb
+---+   +----+
```

Expected direction:

- `format` repairs each box using the existing conservative single-box rules
  and rejoins them with the observed three-space gap.
- `lint` reports the second-box `broken-border` issue on the content-row line.

Outside the `v0.5` frame:

```text
+---+    +---+
| a |    | b |
+---+    +---+
```

Expected direction:

- `format` preserves the block unchanged.
- `lint` reports `unsupported-layout`.

## Tasks

- Specify the structural rules that distinguish the supported small-gap
  adjacent-box shape from unsupported multi-box inputs.
- Define the expected formatter result for the supported shape, including gap
  preservation, width handling, and block preservation rules.
- Define lint expectations for supported, unsupported, and malformed adjacent
  layouts so CLI and MCP stay aligned on one contract.

## Constraints

- Do not add new commands, flags, or MCP tools for `v0.5`.
- Keep existing warning and issue behavior stable unless a contract change is
  necessary and documented by this step.

## Exit Criteria

- The supported small-gap contract is precise enough to implement without
  reopening scope.
- CLI, MCP, and core-engine acceptance examples all follow the same contract.

<!-- Track completion in EXECMAP.md, not in this file. -->
