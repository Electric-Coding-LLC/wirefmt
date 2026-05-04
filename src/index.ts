export * from "./core";
export type {
  WirefmtDescribeToolInput,
  WirefmtDescribeToolResult,
  WirefmtFormatToolInput,
  WirefmtFormatToolResult,
  WirefmtLintToolInput,
  WirefmtLintToolResult,
} from "./mcp";
export {
  createWirefmtMcpServer,
  runMcpCli,
  runWirefmtDescribeTool,
  runWirefmtFormatTool,
  runWirefmtLintTool,
} from "./mcp";
