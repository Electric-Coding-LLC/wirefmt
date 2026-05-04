#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(
  await readFile(path.join(repoRoot, "package.json"), "utf8"),
);
const tarballPath = process.argv[2];
const expectedVersion = process.argv[3] ?? packageJson.version;

if (tarballPath === undefined) {
  throw new Error(
    "Usage: node tools/smoke-packed-install.js <tarball> [version]",
  );
}

const tempDir = await mkdtemp(path.join(os.tmpdir(), "wirefmt-pack-smoke-"));

try {
  run("npm", ["install", "--prefix", tempDir, path.resolve(tarballPath)]);

  const packageDir = path.join(
    tempDir,
    "node_modules",
    ...packageJson.name.split("/"),
  );
  const cliWrapperPath = path.join(packageDir, "bin", "wirefmt");
  const mcpWrapperPath = path.join(packageDir, "bin", "wirefmt-mcp");
  const cliDistPath = path.join(packageDir, "dist", "cli", "bin.js");
  const mcpDistPath = path.join(packageDir, "dist", "mcp", "bin.js");

  assert(existsSync(cliWrapperPath), "installed CLI wrapper is missing");
  assert(existsSync(mcpWrapperPath), "installed MCP wrapper is missing");
  assert(existsSync(cliDistPath), "installed CLI bundle is missing");
  assert(existsSync(mcpDistPath), "installed MCP bundle is missing");
  assert(
    !existsSync(path.join(packageDir, "src")),
    "installed package still includes src runtime files",
  );

  const cliWrapper = await readFile(cliWrapperPath, "utf8");
  const mcpWrapper = await readFile(mcpWrapperPath, "utf8");

  assert(
    cliWrapper.startsWith("#!/usr/bin/env node\n"),
    "installed CLI wrapper is not Node-launched",
  );
  assert(
    cliWrapper.includes("../dist/cli/bin.js"),
    "installed CLI wrapper does not point at the bundled dist entrypoint",
  );
  assert(
    mcpWrapper.startsWith("#!/usr/bin/env node\n"),
    "installed MCP wrapper is not Node-launched",
  );
  assert(
    mcpWrapper.includes("../dist/mcp/bin.js"),
    "installed MCP wrapper does not point at the bundled dist entrypoint",
  );

  const wirefmtBin = path.join(tempDir, "node_modules", ".bin", "wirefmt");
  const wirefmtMcpBin = path.join(
    tempDir,
    "node_modules",
    ".bin",
    "wirefmt-mcp",
  );

  const version = run(wirefmtBin, ["--version"]);
  assert(
    version.stdout.trim() === expectedVersion,
    "unexpected wirefmt version",
  );

  const help = run(wirefmtBin, ["--help"]);
  assert(
    help.stdout.includes("wirefmt format [file]"),
    "wirefmt help output is missing format usage",
  );
  assert(
    help.stdout.includes("wirefmt lint [file]"),
    "wirefmt help output is missing lint usage",
  );

  const format = run(wirefmtBin, ["format"], { input: "+--+\n|x|\n+--+\n" });
  assert(
    format.stdout === "+---+\n| x |\n+---+\n",
    "unexpected wirefmt format output",
  );

  const lint = run(wirefmtBin, ["lint"], {
    input: "+--+\n|x\n+--+\n",
    allowFailure: true,
  });
  assert(lint.status === 1, "wirefmt lint did not exit with code 1");
  assert(
    lint.stdout.includes("<stdin>:2: broken-border"),
    "wirefmt lint output did not preserve the expected finding",
  );

  const mcpVersion = run(wirefmtMcpBin, ["--version"]);
  assert(
    mcpVersion.stdout.trim() === expectedVersion,
    "unexpected wirefmt-mcp version",
  );

  await verifyMcpTransport(wirefmtMcpBin, tempDir, expectedVersion);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
    input: options.input,
  });

  if (!options.allowFailure && result.status !== 0) {
    const stderr = result.stderr.trim();
    throw new Error(
      stderr.length > 0
        ? `${command} ${args.join(" ")} failed: ${stderr}`
        : `${command} ${args.join(" ")} failed`,
    );
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

async function verifyMcpTransport(command, cwd, expectedVersion) {
  const client = new Client({
    name: "wirefmt-packed-smoke",
    version: "0.0.0",
  });
  const transport = new StdioClientTransport({
    command,
    cwd,
    stderr: "pipe",
  });

  try {
    await client.connect(transport);

    const serverVersion = client.getServerVersion();
    assert(
      serverVersion?.name === "wirefmt",
      "MCP server did not identify itself as wirefmt",
    );
    assert(
      serverVersion?.version === expectedVersion,
      "unexpected MCP server version",
    );

    const toolList = await client.listTools();
    const toolNames = toolList.tools.map((tool) => tool.name).sort();
    assert(
      toolNames.join(",") ===
        ["wirefmt.describe", "wirefmt.format", "wirefmt.lint"].join(","),
      "unexpected MCP tool list",
    );

    const formatResult = await client.callTool({
      name: "wirefmt.format",
      arguments: {
        text: "+--+\n|x|\n+--+\n",
      },
    });
    assert(
      formatResult.structuredContent?.formattedText ===
        "+---+\n| x |\n+---+\n" &&
        formatResult.structuredContent?.changed === true,
      "unexpected MCP format result",
    );

    const lintResult = await client.callTool({
      name: "wirefmt.lint",
      arguments: {
        text: "+--+\n|x\n+--+\n",
        source: "fixture.txt",
      },
    });
    const issues = lintResult.structuredContent?.issues;
    assert(
      Array.isArray(issues) && issues.length === 1,
      "unexpected MCP lint result",
    );
    assert(
      issues[0]?.code === "broken-border" &&
        issues[0]?.source === "fixture.txt" &&
        issues[0]?.lineOrBlock === "2",
      "unexpected MCP lint issue payload",
    );

    const describeResult = await client.callTool({
      name: "wirefmt.describe",
      arguments: {
        text: "+--+\n|x|\n+--+\n",
      },
    });
    assert(
      describeResult.structuredContent?.promptText ===
        'A UI layout with one box labeled "x".',
      "unexpected MCP describe result",
    );
  } finally {
    await client.close();
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
