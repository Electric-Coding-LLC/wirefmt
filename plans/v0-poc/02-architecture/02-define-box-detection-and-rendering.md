# Define Box Detection And Rendering

[Back to Plan](../PLAN.md)

## Goal

Define how `wirefmt` recognizes intended boxes and how it re-renders them safely.

## Detection Rules

- Treat a block as a candidate box only when it clearly looks like one rectangular wireframe region.
- Require at least one top or bottom border candidate containing `+` corners and horizontal `-` runs.
- Require interior row intent from `|` characters at roughly consistent left and right edge columns.
- Accept imperfect boxes when one border or some side edges are inconsistent but the rectangle is still obvious.
- Reject blocks that cannot be interpreted as a single rectangular wireframe region with confidence.

## Rendering Rules

- Normalize top and bottom borders to `+-----+`.
- Normalize content rows to `| <content padded to width> |` when padding is enabled.
- Treat `--width` as the target outer width, including borders.
- When `--width` is omitted, use the minimum outer width that fits the content and configured padding.
- When `--width` is smaller than the required width, ignore it and expand to the required width.
- Never wrap, truncate, or reflow text.
- Keep text content exactly in order.
- Preserve blank content rows that already exist in the source block.
- Do not insert new semantic lines or move content between rows.

## Fallback Rules

- If a block appears to contain multiple adjacent boxes or a non-rectangular layout, pass the entire block through unchanged.
- Do not partially format a block when confidence is too low.
- Let lint mode report unsupported or malformed layouts instead of guessing.

## Exit Criteria

- Candidate-box heuristics are explicit.
- Rendering rules are concrete enough for golden tests.
- Ambiguous cases have documented fallback behavior.
