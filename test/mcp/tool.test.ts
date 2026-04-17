import { describe, expect, test } from "bun:test";
import { runWirefmtFormatTool } from "../../src/mcp";

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
