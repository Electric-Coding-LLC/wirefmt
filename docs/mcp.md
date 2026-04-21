# MCP Integration

`wirefmt` ships a stdio MCP server through the `wirefmt-mcp` executable. The
`v0.5` agent-facing surface is intentionally small: `wirefmt.format` and
`wirefmt.lint`.

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

The server registers two tools:

- `wirefmt.format`
- `wirefmt.lint`

Behavior notes:

- `wirefmt.format` and `wirefmt.lint` still use the same shared core engine as
  the CLI.
- In `v0.8`, that shared engine supports single boxes, one bounded compound-box
  panel shape, plus exactly two or three
  adjacent sibling boxes in one block when adjacent boxes are separated by one
  to three literal space columns and all boxes share the same row structure.
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
  "text": "+---+   +----+\n|a|   |bb|\n+---+   +----+\n",
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
instructions, have them prefer `wirefmt.format` for formatting and
`wirefmt.lint` for structured findings.

This repo keeps the canonical skill text in
[`skills/wirefmt/SKILL.md`](../skills/wirefmt/SKILL.md) plus the matching agent
prompt in [`skills/wirefmt/agents/openai.yaml`](../skills/wirefmt/agents/openai.yaml).

## Notes

- The MCP server uses the same shared formatter and lint engine as the CLI.
- `warnings` is omitted when there is nothing to report.
- `wirefmt.lint` defaults `source` to `<stdin>` when it is omitted.
- `structuredContent` is the canonical result contract for both tools.
