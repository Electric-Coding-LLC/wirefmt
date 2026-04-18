import { describe, expect, test } from "bun:test";
import { runMcpCli } from "../../src/mcp";
import type { McpRuntime } from "../../src/mcp/run";
import { WIREFMT_VERSION } from "../../src/version";

describe("runMcpCli", () => {
  test("starts the MCP server without a banner in non-interactive mode", async () => {
    const runtime = createRuntime();

    const exitCode = await runMcpCli([], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.serverStarted).toBe(true);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toBe("");
  });

  test("prints a startup banner when only stderr is interactive", async () => {
    const runtime = createRuntime({
      interactiveStderr: true,
    });

    const exitCode = await runMcpCli([], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.serverStarted).toBe(true);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toBe("wirefmt-mcp stdio server is running.\n");
  });

  test("reports raw terminal launches as a usage error", async () => {
    const runtime = createRuntime({
      interactiveSession: true,
      interactiveStderr: true,
    });

    const exitCode = await runMcpCli([], runtime);

    expect(exitCode).toBe(2);
    expect(runtime.serverStarted).toBe(false);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toBe(
      "wirefmt-mcp is a stdio MCP server and expects an MCP client, not a raw terminal.\nUse --help or --version for direct checks.\n",
    );
  });

  test("prints help with a zero exit code", async () => {
    const runtime = createRuntime();

    const exitCode = await runMcpCli(["--help"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.serverStarted).toBe(false);
    expect(runtime.stdout).toContain("wirefmt-mcp --version");
    expect(runtime.stderr).toBe("");
  });

  test("prints version with a zero exit code", async () => {
    const runtime = createRuntime();

    const exitCode = await runMcpCli(["--version"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.serverStarted).toBe(false);
    expect(runtime.stdout).toBe(`${WIREFMT_VERSION}\n`);
    expect(runtime.stderr).toBe("");
  });

  test("reports unknown arguments as an operational error", async () => {
    const runtime = createRuntime();

    const exitCode = await runMcpCli(["--bogus"], runtime);

    expect(exitCode).toBe(2);
    expect(runtime.serverStarted).toBe(false);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toBe("Unknown arguments. Use --help for usage.\n");
  });
});

function createRuntime(values?: {
  readonly interactiveSession?: boolean;
  readonly interactiveStderr?: boolean;
}): McpRuntime & {
  readonly stdout: string;
  readonly stderr: string;
  readonly serverStarted: boolean;
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  let serverStarted = false;

  return {
    isInteractiveSession() {
      return values?.interactiveSession ?? false;
    },
    isInteractiveStderr() {
      return values?.interactiveStderr ?? false;
    },
    async startServer() {
      serverStarted = true;
    },
    writeStdout(text) {
      stdout.push(text);
    },
    writeStderr(text) {
      stderr.push(text);
    },
    get stdout() {
      return stdout.join("");
    },
    get stderr() {
      return stderr.join("");
    },
    get serverStarted() {
      return serverStarted;
    },
  };
}
