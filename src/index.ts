export * from "./core";
export type {
  WirefmtFormatToolInput,
  WirefmtFormatToolResult,
  WirefmtLintToolInput,
  WirefmtLintToolResult,
} from "./mcp";
export {
  createWirefmtMcpServer,
  runWirefmtFormatTool,
  runWirefmtLintTool,
} from "./mcp";
