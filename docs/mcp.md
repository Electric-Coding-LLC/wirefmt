# MCP Integration

`wirefmt` ships a stdio MCP server through the `wirefmt-mcp` executable. The
`v0.2` agent-facing surface is intentionally small: `wirefmt.format` and
`wirefmt.lint`.

## Prerequisite

Install Bun first:

```sh
bun install
```

For a published install:

```sh
bun install -g @electric_coding/wirefmt
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

For Codex, point `~/.codex/config.toml` at the same stdio server. A separate
skill is optional; if you keep agent instructions, have them prefer
`wirefmt.format` for formatting and `wirefmt.lint` for structured findings.

## Notes

- The MCP server uses the same shared formatter and lint engine as the CLI.
- `warnings` is omitted when there is nothing to report.
- `wirefmt.lint` defaults `source` to `<stdin>` when it is omitted.
- `structuredContent` is the canonical result contract for both tools.
