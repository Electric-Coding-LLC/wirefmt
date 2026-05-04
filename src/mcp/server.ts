import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";
import { formatLintIssuesText } from "../lint-output";
import { WIREFMT_VERSION } from "../version";
import {
  runWirefmtDescribeTool,
  runWirefmtFormatTool,
  runWirefmtLintTool,
} from "./tool";

const warningSchema = z.object({
  code: z.string(),
  message: z.string(),
});

const lintIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
  source: z.string(),
  lineOrBlock: z.string(),
});

const describeBoxSchema = z.object({
  position: z.enum(["left", "center", "right"]),
  label: z.string(),
});

const describePanelSchema = z.object({
  position: z.enum(["top", "middle", "bottom"]),
  label: z.string(),
});

const describeLayoutSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("single-box"),
    startLine: z.number(),
    endLine: z.number(),
    label: z.string(),
  }),
  z.object({
    kind: z.literal("horizontal-sibling-boxes"),
    startLine: z.number(),
    endLine: z.number(),
    boxes: z.array(describeBoxSchema),
    gaps: z.array(z.number()),
  }),
  z.object({
    kind: z.literal("compound-panel"),
    startLine: z.number(),
    endLine: z.number(),
    panels: z.array(describePanelSchema),
  }),
]);

export function createWirefmtMcpServer(): McpServer {
  const server = new McpServer({
    name: "wirefmt",
    version: WIREFMT_VERSION,
  });

  server.registerTool(
    "wirefmt.format",
    {
      description:
        "Format ASCII wireframe text with the shared wirefmt engine.",
      inputSchema: {
        text: z.string().describe("Wireframe text to format."),
        width: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Optional target outer width, including borders."),
        pad: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Optional inner horizontal padding per side."),
      },
      outputSchema: {
        formattedText: z.string(),
        changed: z.boolean(),
        warnings: z.array(warningSchema).optional(),
      },
    },
    async (input) => {
      const result = runWirefmtFormatTool({
        text: input.text,
        ...(input.width === undefined ? {} : { width: input.width }),
        ...(input.pad === undefined ? {} : { pad: input.pad }),
      });

      return {
        content: [
          {
            type: "text",
            text: result.formattedText,
          },
        ],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "wirefmt.lint",
    {
      description:
        "Lint ASCII wireframe text with the shared wirefmt analysis engine.",
      inputSchema: {
        text: z.string().describe("Wireframe text to lint."),
        source: z
          .string()
          .optional()
          .describe("Optional source label for findings. Defaults to <stdin>."),
      },
      outputSchema: {
        issues: z.array(lintIssueSchema),
      },
    },
    async (input) => {
      const result = runWirefmtLintTool({
        text: input.text,
        ...(input.source === undefined ? {} : { source: input.source }),
      });

      return {
        content: [
          {
            type: "text",
            text:
              result.issues.length === 0
                ? "No lint issues found."
                : formatLintIssuesText(result.issues),
          },
        ],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "wirefmt.describe",
    {
      description:
        "Export deterministic layout JSON and prompt text for supported ASCII wireframes.",
      inputSchema: {
        text: z.string().describe("Wireframe text to describe."),
      },
      outputSchema: {
        layouts: z.array(describeLayoutSchema),
        promptText: z.string(),
        warnings: z.array(warningSchema).optional(),
      },
    },
    async (input) => {
      const result = runWirefmtDescribeTool({
        text: input.text,
      });

      return {
        content: [
          {
            type: "text",
            text:
              result.promptText.length === 0
                ? "No supported wireframe layout detected."
                : result.promptText,
          },
        ],
        structuredContent: result,
      };
    },
  );

  return server;
}

export async function startWirefmtMcpServer(): Promise<void> {
  const server = createWirefmtMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
