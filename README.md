# wirefmt

`wirefmt` is a conservative ASCII wireframe formatter and linter with matching
CLI and MCP surfaces for the same small box workflows.

## What It Does

- Normalizes single-box wireframe blocks that use `+`, `-`, and `|`.
- Preserves blank-line-separated non-box blocks around formatted boxes.
- Uses one shared core engine for the CLI and MCP tool.
- Leaves unsupported layouts unchanged instead of guessing.
- Keeps `format` and `lint` available through both CLI and MCP.

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
bun run cli --help
```

Basic formatting from stdin:

```sh
printf '+--+\n|x|\n+--+\n' | bun run cli format
```

Output:

```text
+---+
| x |
+---+
```

Formatting a file:

```sh
bun run cli format ./example.txt
```

Formatting with an explicit outer width and padding:

```sh
printf '+---+\n|x|\n+---+\n' | bun run cli format --width 10 --pad 2
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
printf '+--+\n|x\n+--+\n' | bun run cli lint
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

For direct checks from this checkout:

```sh
bun run mcp:help
bun run mcp:version
```

To launch the stdio server for an MCP client from this checkout:

```sh
bun run mcp:serve
```

After installation, an MCP client can also run:

```sh
wirefmt-mcp
```

Version check after installation:

```sh
wirefmt-mcp --version
```

Registered tools:

- `wirefmt.format`
- `wirefmt.lint`

MCP client wiring examples:

- [docs/mcp.md](./docs/mcp.md)

`wirefmt.format` input:

```json
{
  "text": "+--+\n|x|\n+--+\n",
  "width": 10,
  "pad": 1
}
```

`wirefmt.format` result:

```json
{
  "formattedText": "+--------+\n| x      |\n+--------+\n",
  "changed": true
}
```

`wirefmt.lint` input:

```json
{
  "text": "+--+\n|x\n+--+\n",
  "source": "fixture.txt"
}
```

`wirefmt.lint` result:

```json
{
  "issues": [
    {
      "code": "broken-border",
      "message": "Content row is missing a closing edge.",
      "source": "fixture.txt",
      "lineOrBlock": "2"
    }
  ]
}
```

Notes:

- `warnings` is omitted when the formatter has nothing to report.
- `wirefmt.format` uses the same formatter as the CLI.
- `wirefmt.lint` uses the same lint engine and stable issue codes as the CLI.
- MCP `structuredContent` carries the canonical result contract. Text content is
  still included for client compatibility.

## Codex Setup

To use `wirefmt` from Codex, wire up the local MCP server first. The shipped
MCP tools are enough on their own; a custom skill is optional.

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.wirefmt]
enabled = true
command = "bun"
args = ["run", "/Users/iamce/dev/electric/wirefmt/src/mcp/bin.ts"]
```

Then restart Codex. If you want a persistent instruction, add something short
like this to your relevant skill or agent instructions:

```text
Use `wirefmt.format` to normalize supported ASCII wireframe boxes.
Use `wirefmt.lint` to inspect suspected problems without changing the input.
Do not fall back to the CLI unless the MCP server is unavailable.
```

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

- `v0.2` release message: `wirefmt v0.2 makes formatting and linting available through matching CLI and MCP surfaces backed by one conservative box engine.`
- The first `v0.2` release from the current `0.1.x` line should use a minor
  bump to produce `0.2.0`.
- Published package contents are limited to source files and end-user docs.
- A release-candidate tarball can be checked locally with `bun pm pack` before
  publishing.
- Use `bun run release -- <patch|minor|major|x.y.z>` to bump the version, run
  the local release gate, commit the version bump, and tag `v<version>`.
- The release helper now verifies the packaged `wirefmt` CLI and
  `wirefmt-mcp` server from a clean temp install before it creates a tag.
- The release publish and tagging flow lives in [docs/release.md](./docs/release.md).
