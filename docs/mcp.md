# MCP Integration

`wirefmt` ships a stdio MCP server through the `wirefmt-mcp` executable. The
agent-facing surface is intentionally small: `wirefmt.format`, `wirefmt.lint`,
and `wirefmt.describe`.

## Runtime Prerequisites

Installed-package users need Node.js `>=18.17.0`.

Contributors running the server directly from this checkout still need Bun
`>=1.3.11`.

For a published install:

```sh
npm install -g @electric_coding/wirefmt
```

## Global Install Configuration

After a global install, point your MCP client at the shipped executable:

```json
{
  "mcpServers": {
    "wirefmt": {
      "command": "wirefmt-mcp"
    }
  }
}
```

## Local Checkout Configuration

To run the MCP server directly from this repo checkout, use Bun to launch the
entrypoint:

```json
{
  "mcpServers": {
    "wirefmt": {
      "command": "bun",
      "args": [
        "run",
        "/absolute/path/to/wirefmt/src/mcp/bin.ts"
      ]
    }
  }
}
```

## Tool Surface

The server registers three tools:

- `wirefmt.format`
- `wirefmt.lint`
- `wirefmt.describe`

Behavior notes:

- `wirefmt.format`, `wirefmt.lint`, and `wirefmt.describe` still use the same
  shared core engine as the CLI.
- That shared engine supports single boxes, one bounded compound-box panel
  shape, plus exactly two or three adjacent sibling boxes in one block when
  adjacent boxes are separated by one to three literal space columns and all
  boxes share the same row structure.
- `wirefmt.describe` exports deterministic layout JSON and prompt text for
  supported layouts. It does not call image generation.
- Conservative unsupported cases now use stable diagnostics such as
  `unsupported-box-columns`, `unsupported-adjacent-gap`,
  `unsupported-adjacent-stagger`, `unsupported-interior-border`, and
  `text-outside-box`.

`wirefmt.format` input:

```json
{
  "text": "+--+\n|x|\n+--+\n",
  "width": 10,
  "pad": 1
}
```

`wirefmt.format` output:

```json
{
  "formattedText": "+--------+\n| x      |\n+--------+\n",
  "changed": true
}
```

`wirefmt.format` also supports the bounded adjacent sibling-box shape:

```json
{
  "text": "+---+   +----+\n| a |   | bb |\n+---+   +----+\n",
  "width": 10,
  "pad": 1
}
```

```json
{
  "formattedText": "+--------+   +--------+\n| a      |   | bb     |\n+--------+   +--------+\n",
  "changed": true
}
```

`wirefmt.describe` input:

```json
{
  "text": "+-----+\n| top |\n+-----+\n| mid |\n+-----+\n| bot |\n+-----+\n"
}
```

`wirefmt.describe` output:

```json
{
  "layouts": [
    {
      "kind": "compound-panel",
      "startLine": 1,
      "endLine": 7,
      "panels": [
        {
          "position": "top",
          "label": "top"
        },
        {
          "position": "middle",
          "label": "mid"
        },
        {
          "position": "bottom",
          "label": "bot"
        }
      ]
    }
  ],
  "promptText": "A UI layout with one outer frame containing 3 stacked panels separated by full-width horizontal dividers. The top panel is labeled \"top\". The middle panel is labeled \"mid\". The bottom panel is labeled \"bot\"."
}
```

`wirefmt.lint` input:

```json
{
  "text": "+--+\n|x\n+--+\n",
  "source": "fixture.txt"
}
```

`wirefmt.lint` output:

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

## Codex Note

For Codex, prefer the installed executable when you want the same runtime path
users get from npm:

```toml
[mcp_servers.wirefmt]
enabled = true
command = "wirefmt-mcp"
```

For repo-local development, point `~/.codex/config.toml` at the Bun-launched
checkout server shown above. A separate skill is optional; if you keep agent
instructions, have them prefer `wirefmt.format` for formatting,
`wirefmt.lint` for structured findings, and `wirefmt.describe` for
deterministic prompt scaffolds.

This repo keeps the canonical skill text in
[`skills/wirefmt/SKILL.md`](../skills/wirefmt/SKILL.md) plus the matching agent
prompt in [`skills/wirefmt/agents/openai.yaml`](../skills/wirefmt/agents/openai.yaml).

## Notes

- The MCP server uses the same shared formatter and lint engine as the CLI.
- `warnings` is omitted when there is nothing to report.
- `wirefmt.lint` defaults `source` to `<stdin>` when it is omitted.
- `structuredContent` is the canonical result contract for all tools.
