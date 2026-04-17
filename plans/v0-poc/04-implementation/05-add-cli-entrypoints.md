# Add CLI Entrypoints

[Back to Plan](../PLAN.md)

## Goal

Ship a usable local command that exposes the formatter cleanly.

## Tasks

- Implement `format` command with file and `stdin` support.
- Add `--width` and `--pad`.
- Print formatted output to `stdout`.
- Add basic help and version output.

## Exit Criteria

- `wirefmt format <file>` works.
- `cat file | wirefmt format` works.
- Flag parsing and error handling are stable.
