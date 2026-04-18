export * from "./core";
export type {
  WirefmtFormatToolInput,
  WirefmtFormatToolResult,
  WirefmtLintToolInput,
  WirefmtLintToolResult,
} from "./mcp";
export {
  createWirefmtMcpServer,
  runMcpCli,
  runWirefmtFormatTool,
  runWirefmtLintTool,
} from "./mcp";
