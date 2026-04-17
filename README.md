# wirefmt

`wirefmt` formats simple ASCII wireframe boxes and reports conservative lint
findings for box-shaped text that looks malformed.

## What It Does

- Normalizes single-box wireframe blocks that use `+`, `-`, and `|`.
- Preserves blank-line-separated non-box blocks around formatted boxes.
- Uses one shared core engine for the CLI and MCP tool.
- Leaves unsupported layouts unchanged instead of guessing.

## Current Prerequisite

`wirefmt` currently targets Bun and ships Bun-based executables.

```sh
bun install
```

## Install

Published package:

```sh
bun install -g @electric_coding/wirefmt
```

Release helper:

```sh
bun run release -- patch
```

Local tarball smoke-test flow:

```sh
bun pm pack
tarball="$(ls ./*.tgz)"
bun add "$tarball"
./node_modules/.bin/wirefmt --version
```

Installed executables:

- `wirefmt`
- `wirefmt-mcp`

## Run The CLI

You can run the CLI directly from this checkout:

```sh
bun run src/cli/bin.ts --help
```

Basic formatting from stdin:

```sh
printf '+--+\n|x|\n+--+\n' | bun run src/cli/bin.ts format
```

Output:

```text
+---+
| x |
+---+
```

Formatting a file:

```sh
bun run src/cli/bin.ts format ./example.txt
```

Formatting with an explicit outer width and padding:

```sh
printf '+---+\n|x|\n+---+\n' | bun run src/cli/bin.ts format --width 10 --pad 2
```

Output:

```text
+--------+
|  x     |
+--------+
```

## CLI Reference

Usage:

```text
wirefmt format [file] [--width <number>] [--pad <number>]
wirefmt lint [file] [--width <number>] [--pad <number>]
wirefmt --help
wirefmt --version
```

Commands:

- `format`: Format a wireframe from a file or stdin.
- `lint`: Report lint findings for a file or stdin.

Flags:

- `--width`: Target outer width, including borders.
- `--pad`: Inner spaces on both left and right sides of content. Default: `1`.
- `--help`: Show usage information.
- `--version`: Show the current version.

Exit codes:

- `0`: Success. `format` wrote formatted or unchanged text. `lint` found no
  issues.
- `1`: `lint` found one or more issues.
- `2`: CLI usage or runtime error.

Notes:

- When `[file]` is omitted, the CLI reads from stdin.
- `lint` currently accepts `--width` and `--pad` for CLI surface parity, but the
  current lint engine does not use them when producing findings.

## Lint Output

`lint` prints one line per issue:

```text
<source>:<line-or-block>: <code> <message>
```

Example:

```sh
printf '+--+\n|x\n+--+\n' | bun run src/cli/bin.ts lint
```

Output:

```text
<stdin>:2: broken-border Content row is missing a closing edge.
```

Current issue codes:

- `ambiguous-box`
- `broken-border`
- `misaligned-edge`
- `uneven-width`
- `unsupported-layout`

## MCP Usage

Start the MCP server over stdio:

```sh
bun run src/mcp/bin.ts
```

After installation, you can also run:

```sh
wirefmt-mcp
```

Registered tool:

- `wirefmt.format`

MCP client wiring examples:

- [docs/mcp.md](./docs/mcp.md)

Input shape:

```json
{
  "text": "+--+\n|x|\n+--+\n",
  "width": 10,
  "pad": 1
}
```

Result shape:

```json
{
  "formattedText": "+--------+\n| x      |\n+--------+\n",
  "changed": true,
  "warnings": []
}
```

Notes:

- `warnings` is omitted when the formatter has nothing to report.
- The MCP tool uses the same formatter as the CLI, so behavior should match for
  the same input.
- The current MCP surface exposes formatting only. Lint is CLI-only for now.

## Codex Setup

To use `wirefmt` from Codex, wire up the local MCP server and install the
matching skill.

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.wirefmt]
enabled = true
command = "bun"
args = ["run", "/Users/iamce/dev/electric/wirefmt/src/mcp/bin.ts"]
```

Install the `wirefmt` skill from your skills repo into `~/.codex/skills`
(a symlink works well):

```sh
ln -s /Users/iamce/dev/electric/skills/wirefmt ~/.codex/skills/wirefmt
```

Then restart Codex. The skill tells Codex to use `wirefmt.format` for
formatting and the CLI for linting.

## Formatting Guarantees

- `width` is interpreted as the full outer width, including both borders.
- If `width` is smaller than the minimum valid box width, `wirefmt` uses the
  minimum valid width instead of truncating content.
- Content is trimmed, then rendered with the requested left and right padding.
- Blank-line-separated blocks stay separate.
- Leading blank lines, trailing blank lines, and the original line-ending style
  are preserved.
- Plain text that does not look like a box passes through unchanged.
- Unsupported or ambiguous box-like layouts pass through unchanged and may emit
  formatter warnings.

## Non-Goals And Boundaries

`wirefmt` is intentionally conservative. It does not try to repair or reinterpret
every ASCII diagram.

Current non-goals:

- Formatting multiple adjacent boxes or column layouts in one block.
- Formatting layouts with interior border rows.
- Moving or rewriting text that appears outside the detected box.
- Acting as a general-purpose ASCII art formatter.
- Inferring author intent when the border shape is ambiguous.

If a block falls outside the supported shape, `format` preserves the original
text and reports a warning when appropriate. Use `lint` to surface likely
problems without changing the input.

## Release Build Notes

- The `v0-poc` package version is `0.1.0`.
- Published package contents are limited to source files and end-user docs.
- A release-candidate tarball can be checked locally with `bun pm pack` before
  publishing.
- Use `bun run release -- <patch|minor|major|x.y.z>` to bump the version, run
  the local release gate, commit the version bump, and tag `v<version>`.
- The release publish and tagging flow lives in [docs/release.md](./docs/release.md).
