import { describe, expect, test } from "bun:test";
import { formatWireframe, lintWireframe } from "../../src/core";

describe("formatWireframe", () => {
  test("preserves input in the foundation scaffold", () => {
    const input = "+---+\n| x |\n+---+\n";

    const result = formatWireframe(input, {
      pad: 1,
      width: 5,
    });

    expect(result).toEqual({
      formattedText: input,
      changed: false,
      warnings: [],
    });
  });
});

describe("lintWireframe", () => {
  test("returns no findings in the foundation scaffold", () => {
    const result = lintWireframe("+---+\n|x|\n+---+\n", "fixture.txt");

    expect(result.issues).toEqual([]);
  });
});
