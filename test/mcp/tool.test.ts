import { describe, expect, test } from "bun:test";
import { runWirefmtFormatTool, runWirefmtLintTool } from "../../src/mcp";

describe("runWirefmtFormatTool", () => {
  test("uses the shared core formatter with default padding", () => {
    const input = "+--+\n|x|\n+--+\n";

    const result = runWirefmtFormatTool({
      text: input,
    });

    expect(result).toEqual({
      formattedText: "+---+\n| x |\n+---+\n",
      changed: true,
    });
  });

  test("honors explicit width and passes through unsupported text", () => {
    const widened = runWirefmtFormatTool({
      text: "+---+\n|x|\n+---+\n",
      width: 10,
    });
    const passthrough = runWirefmtFormatTool({
      text: "plain text\n",
    });

    expect(widened).toEqual({
      formattedText: "+--------+\n| x      |\n+--------+\n",
      changed: true,
    });
    expect(passthrough).toEqual({
      formattedText: "plain text\n",
      changed: false,
    });
  });
});

describe("runWirefmtLintTool", () => {
  test("defaults the lint source to stdin and uses the shared core engine", () => {
    const result = runWirefmtLintTool({
      text: "+----+\n|x\n+--+\n",
    });

    expect(result).toEqual({
      issues: [
        {
          code: "broken-border",
          message: "Content row is missing a closing edge.",
          source: "<stdin>",
          lineOrBlock: "2",
        },
        {
          code: "broken-border",
          message: "Border corners are not aligned to the detected box.",
          source: "<stdin>",
          lineOrBlock: "3",
        },
        {
          code: "uneven-width",
          message: "Rows do not agree on a single box width.",
          source: "<stdin>",
          lineOrBlock: "1",
        },
      ],
    });
  });

  test("honors an explicit lint source and returns an empty issue list", () => {
    const result = runWirefmtLintTool({
      text: "+---+\n| x |\n+---+\n",
      source: "fixture.txt",
    });

    expect(result).toEqual({
      issues: [],
    });
  });
});
