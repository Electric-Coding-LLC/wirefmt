import { describe, expect, test } from "bun:test";
import { formatWireframe, lintWireframe } from "../../src/core";

describe("formatWireframe", () => {
  test("normalizes a simple box", () => {
    const input = "+--+\n|x|\n+--+\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: "+---+\n| x |\n+---+\n",
      changed: true,
      warnings: [],
    });
  });

  test("preserves surrounding blocks while formatting a box block", () => {
    const input = "Title\n\n +--+\n |x|\n +--+\n\nNotes\n";

    const result = formatWireframe(input, {
      pad: 1,
      width: 8,
    });

    expect(result).toEqual({
      formattedText: "Title\n\n +------+\n | x    |\n +------+\n\nNotes\n",
      changed: true,
      warnings: [],
    });
  });

  test("passes unsupported multi-box layouts through unchanged with warnings", () => {
    const input = "+--+ +--+\n|a| |b|\n+--+ +--+\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "unsupported-layout",
          message: "Contains multiple adjacent boxes or columns.",
        },
      ],
    });
  });

  test("preserves literal pipe characters inside box content", () => {
    const input = "+-------+\n| A | B |\n+-------+\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: input,
      changed: false,
      warnings: [],
    });
  });
});

describe("lintWireframe", () => {
  test("returns no findings for a clean normalized box", () => {
    const result = lintWireframe("+---+\n| x |\n+---+\n", "fixture.txt");

    expect(result.issues).toEqual([]);
  });

  test("reports broken borders and uneven width for malformed boxes", () => {
    const result = lintWireframe("+----+\n|x\n+--+\n", "fixture.txt");

    expect(result.issues).toEqual([
      {
        code: "broken-border",
        message: "Content row is missing a closing edge.",
        source: "fixture.txt",
        lineOrBlock: "2",
      },
      {
        code: "broken-border",
        message: "Border corners are not aligned to the detected box.",
        source: "fixture.txt",
        lineOrBlock: "3",
      },
      {
        code: "uneven-width",
        message: "Rows do not agree on a single box width.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("reports unsupported multi-box layouts conservatively", () => {
    const result = lintWireframe(
      "+--+ +--+\n|a| |b|\n+--+ +--+\n",
      "fixture.txt",
    );

    expect(result.issues).toEqual([
      {
        code: "unsupported-layout",
        message: "Contains multiple adjacent boxes or columns.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("does not flag literal pipe characters inside valid box content", () => {
    const result = lintWireframe(
      "+-------+\n| A | B |\n+-------+\n",
      "fixture.txt",
    );

    expect(result.issues).toEqual([]);
  });
});
