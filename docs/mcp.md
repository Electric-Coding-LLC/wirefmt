# MCP Integration

`wirefmt` ships a stdio MCP server through the `wirefmt-mcp` executable.

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

The server currently registers one tool:

- `wirefmt.format`

Input:

```json
{
  "text": "+--+\n|x|\n+--+\n",
  "width": 10,
  "pad": 1
}
```

Output:

```json
{
  "formattedText": "+--------+\n| x      |\n+--------+\n",
  "changed": true,
  "warnings": []
}
```

## Notes

- The MCP server uses the same formatting engine as the CLI.
- `warnings` is omitted when there is nothing to report.
- The current MCP surface is formatting-only. Lint remains CLI-only.
