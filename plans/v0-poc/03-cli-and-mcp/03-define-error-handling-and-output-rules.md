# Define Error Handling And Output Rules

[Back to Plan](../PLAN.md)

## Goal

Make success, failure, and partial-formatting behavior predictable.

## Rules

- If input cannot be parsed as a supported wireframe block, preserve it unchanged unless lint mode is used.
- Report operational failures clearly, such as missing files or invalid flag values.
- Avoid partial rewrites inside a block when confidence is too low.
- Do not emit extra commentary in `format` output.
- Keep formatting deterministic across platforms.
- Treat unsupported multi-box or non-rectangular layouts as passthrough, not best-effort rewrites.

## Lint Expectations

- Report issues in a stable text format:
  - `<source>:<line-or-block>: <code> <message>`
- Use stable issue codes and messages.
- Make lint output useful for CI and agent feedback loops.
- Use `stderr` only for operational failures, not normal lint findings.

## Initial Issue Codes

- `broken-border`
- `uneven-width`
- `misaligned-edge`
- `unsupported-layout`
- `ambiguous-box`

## Exit Criteria

- Unsupported input behavior is explicit.
- Error messages are short and reproducible.
- Lint output format is chosen before implementation.
