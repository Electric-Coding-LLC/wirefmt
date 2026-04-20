# Define supported multi-box scope

[Back to Execution Map](./EXECMAP.md)

## Goal

Define the exact adjacent sibling box shape that `v0.4` will support and lock
the shapes that remain out of scope.

## Scope Decision

`v0.4` supports exactly two horizontal sibling boxes in one block when both
boxes share the same top-border row, the same bottom-border row, the same
number of content rows, and exactly one space column appears between the two
boxes.

Supported examples to anchor the release:

```text
+---+ +---+
| a | | b |
+---+ +---+
```

```text
+----+ +----+
| aa | | bb |
| cc | | dd |
+----+ +----+
```

Still unsupported in `v0.4`:

- Three or more adjacent boxes in one row.
- Wider inter-box gaps or column-style spacing between sibling boxes.
- Staggered boxes that do not start and end on the same rows.
- Nested boxes or layouts with interior border rows.
- Adjacent layouts with text outside the detected boxes.
- General column layouts or other multi-box shapes that require guessing.

## Tasks

- Choose one supported adjacent-box shape that is useful and low-ambiguity.
- Record the shapes that stay unsupported in `v0.4`, including nested boxes,
  interior-border rows, and broader multi-column layouts.
- Capture representative examples for supported formatting, unchanged
  unsupported layouts, and broken-input linting.

## Constraints

- Keep this as the first bounded layout expansion, not a general multi-box
  rewrite.
- Preserve the repo's conservative posture: no guessing hidden intent when
  spacing or borders are ambiguous.

## Exit Criteria

- The `v0.4` scope fits in one sentence and names one supported shape.
- Supported and unsupported examples are concrete enough to drive fixtures and
  implementation decisions.

<!-- Track completion in EXECMAP.md, not in this file. -->
