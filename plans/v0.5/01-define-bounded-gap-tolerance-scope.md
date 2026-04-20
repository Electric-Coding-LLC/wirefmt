# Define bounded gap-tolerance scope

[Back to Execution Map](./EXECMAP.md)

## Goal

Define the exact two-box gap variation that `v0.5` will support and lock the
nearby multi-box shapes that remain out of scope.

## Scope Decision

`v0.5` supports exactly two horizontal sibling boxes in one block when both
boxes share the same top-border row, the same bottom-border row, the same
number of content rows, and a consistent gap of one to three literal space
columns appears between the two boxes on every row.

Supported examples to anchor the release:

```text
+---+ +---+
| a | | b |
+---+ +---+
```

```text
+---+   +----+
| a |   | bb |
+---+   +----+
```

Still unsupported in `v0.5`:

- Three or more adjacent boxes in one row.
- Four-plus space gaps or broader column-style spacing between sibling boxes.
- Staggered boxes that do not start and end on the same rows.
- Nested boxes or layouts with interior border rows.
- Adjacent layouts with text outside the detected boxes.
- General column layouts or other multi-box shapes that require guessing.

## Tasks

- Choose one useful low-ambiguity gap range for the supported two-box frame.
- Record the shapes that stay unsupported in `v0.5`, including wider columns,
  nested boxes, interior-border rows, and broader multi-box layouts.
- Capture representative examples for supported formatting, unchanged
  unsupported layouts, and broken-input linting.

## Constraints

- Keep this as a narrow follow-on to `v0.4`, not a general multi-box rewrite.
- Preserve the repo's conservative posture: no guessing hidden intent when
  spacing or borders are ambiguous.

## Exit Criteria

- The `v0.5` scope fits in one sentence and names one supported gap range.
- Supported and unsupported examples are concrete enough to drive fixtures and
  implementation decisions.

<!-- Track completion in EXECMAP.md, not in this file. -->
