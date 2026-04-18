import { WIREFMT_VERSION } from "../version";
import { MCP_USAGE } from "./help";
import { startWirefmtMcpServer } from "./server";

export interface McpRuntime {
  isInteractiveSession(): boolean;
  isInteractiveStderr(): boolean;
  writeStdout(text: string): void;
  writeStderr(text: string): void;
  startServer(): Promise<void>;
}

const defaultRuntime: McpRuntime = {
  isInteractiveSession() {
    return (
      process.stdin.isTTY === true &&
      process.stdout.isTTY === true &&
      process.stderr.isTTY === true
    );
  },
  isInteractiveStderr() {
    return process.stderr.isTTY === true;
  },
  writeStdout(text) {
    process.stdout.write(text);
  },
  writeStderr(text) {
    process.stderr.write(text);
  },
  async startServer() {
    await startWirefmtMcpServer();
  },
};

export async function runMcpCli(
  argv: readonly string[],
  runtime: McpRuntime = defaultRuntime,
): Promise<number | undefined> {
  if (argv.length === 0) {
    if (runtime.isInteractiveSession()) {
      runtime.writeStderr(
        "wirefmt-mcp is a stdio MCP server and expects an MCP client, not a raw terminal.\nUse --help or --version for direct checks.\n",
      );
      return 2;
    }

    if (runtime.isInteractiveStderr()) {
      runtime.writeStderr("wirefmt-mcp stdio server is running.\n");
    }
    await runtime.startServer();
    return undefined;
  }

  if (argv.length === 1 && argv[0] === "--help") {
    runtime.writeStdout(`${MCP_USAGE}\n`);
    return 0;
  }

  if (argv.length === 1 && argv[0] === "--version") {
    runtime.writeStdout(`${WIREFMT_VERSION}\n`);
    return 0;
  }

  runtime.writeStderr("Unknown arguments. Use --help for usage.\n");
  return 2;
}
