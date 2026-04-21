# wirefmt

`wirefmt` is a conservative ASCII wireframe formatter and linter with matching
CLI and MCP surfaces for the same small box workflows.

## What It Does

- Normalizes single-box wireframe blocks that use `+`, `-`, and `|`.
- Normalizes exactly two or three adjacent sibling boxes in one block when
  they share the same row structure and each adjacent gap is one to three
  literal space columns.
- Preserves blank-line-separated non-box blocks around formatted boxes.
- Uses one shared core engine for the CLI and MCP tool.
- Leaves unsupported layouts unchanged instead of guessing.
- Keeps `format` and `lint` available through both CLI and MCP.

## Runtime Model

- Installed package users need Node.js `>=18.17.0`.
- Contributors and release maintainers still use Bun `>=1.3.11`.

## Install

Published package for end users:

```sh
npm install -g @electric_coding/wirefmt
wirefmt --version
wirefmt-mcp --version
```

Contributor setup from this checkout:

```sh
bun install
```

Release helper:

```sh
bun run release -- <patch|minor|major|x.y.z>
```

Local tarball smoke-test flow:

```sh
bun run build
tarball="$(npm pack --json | node -e 'const fs = require("fs"); const input = fs.readFileSync(0, "utf8"); const match = input.match(/"filename"\\s*:\\s*"([^"]+\\.tgz)"/); if (!match) process.exit(1); console.log(match[1]);')"
tmp_dir="$(mktemp -d)"
npm install --prefix "$tmp_dir" "$PWD/$tarball"
"$tmp_dir/node_modules/.bin/wirefmt" --version
"$tmp_dir/node_modules/.bin/wirefmt-mcp" --version
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

Formatting the supported adjacent sibling-box shape:

```sh
printf '+---+   +----+\n|a|   |bb|\n+---+   +----+\n' | bun run cli format --width 10
```

Output:

```text
+--------+   +--------+
| a      |   | bb     |
+--------+   +--------+
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
  issues. `format` warnings are reported on stderr without changing the exit
  code.
- `1`: `lint` found one or more issues.
- `2`: CLI usage or runtime error.

Notes:

- When `[file]` is omitted, the CLI reads from stdin.
- `format` writes formatted or unchanged text to stdout and reports formatter
  warnings on stderr when a box-like block stays on the conservative pass-through
  path.
- `format` also supports exactly two or three adjacent sibling boxes in one
  block when adjacent boxes are separated by one to three literal space
  columns; `width` and `pad` apply to each box independently, and supported
  layouts preserve the observed gap widths.
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
- `text-outside-box`
- `uneven-width`
- `unsupported-adjacent-gap`
- `unsupported-adjacent-stagger`
- `unsupported-box-columns`
- `unsupported-interior-border`
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

The installed `wirefmt-mcp` wrapper launches the bundled `dist/` server through
Node. For repo-local development, keep using:

```sh
bun run mcp:serve
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

For an installed package, point Codex at the shipped executable:

```toml
[mcp_servers.wirefmt]
enabled = true
command = "wirefmt-mcp"
```

For repo-local development, wire up the checkout directly with Bun. The shipped
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

This repo also tracks a repo-local skill template at
[`skills/wirefmt/SKILL.md`](https://github.com/Electric-Coding-LLC/wirefmt/blob/main/skills/wirefmt/SKILL.md)
with the matching agent prompt in
[`skills/wirefmt/agents/openai.yaml`](https://github.com/Electric-Coding-LLC/wirefmt/blob/main/skills/wirefmt/agents/openai.yaml).
If you keep a separate shared skills repo, copy from those repo files so the
`wirefmt` instructions stay versioned with the tool.

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

- Formatting four or more adjacent boxes or broader column layouts in one
  block.
- Formatting two-box or three-box layouts with four-plus space gaps, staggered
  rows, or mismatched vertical structure.
- Formatting layouts with interior border rows.
- Moving or rewriting text that appears outside the detected box.
- Acting as a general-purpose ASCII art formatter.
- Inferring author intent when the border shape is ambiguous.

If a block falls outside the supported shape, `format` preserves the original
text and reports a warning when appropriate. Common conservative cases use
stable diagnostics instead of one generic unsupported warning:

- `unsupported-box-columns`: four-plus sibling boxes or broader column layouts
- `unsupported-adjacent-gap`: adjacent boxes separated by unsupported gaps
- `unsupported-adjacent-stagger`: adjacent boxes that do not share one row structure
- `unsupported-interior-border`: interior border rows inside one block
- `text-outside-box`: trailing or surrounding text outside the detected box

Use `lint` to surface likely problems without changing the input.

## Releases

Normal PRs do not need release metadata.

When you want to cut a release, run:

```sh
bun run release -- <patch|minor|major|x.y.z>
```

That command:

- bumps the package version
- updates `CHANGELOG.md`
- runs the release gate
- verifies the packaged tarball from a clean temp install
- commits and tags the release
- pushes the tag for publication

The GitHub Actions release workflow then publishes the tagged version and uses
the matching `CHANGELOG.md` entry for the GitHub release notes.

Use [CHANGELOG.md](./CHANGELOG.md) for shipped history and
[docs/release.md](./docs/release.md) for the maintainer runbook.
