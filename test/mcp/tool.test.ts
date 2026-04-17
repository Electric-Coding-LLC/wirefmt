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
});
