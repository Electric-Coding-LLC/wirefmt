# Define CLI Surface

[Back to Plan](../PLAN.md)

## Goal

Define the command-line interface for formatting and optional linting.

## Commands

- `wirefmt format <file>`
- `wirefmt format`
- `wirefmt lint <file>`
- `wirefmt lint`

## Flags

- `--width` target outer width, including borders
- `--pad` integer number of inner spaces on both left and right sides of content, default `1`
- `--help`
- `--version`

## Behavior

- When a file path is provided, read that file.
- When no file path is provided, read from `stdin`.
- Write formatted output to `stdout`.
- Write lint findings to `stdout`.
- Write operational errors to `stderr`.
- `format` exits `0` on success and `2` on operational failure.
- `lint` exits `0` when no issues are found, `1` when issues are found, and `2` on operational failure.

## Exit Criteria

- Every command has an unambiguous input source.
- Flag semantics are fixed before implementation.
- Exit-code behavior is documented.
