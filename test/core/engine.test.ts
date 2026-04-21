import { describe, expect, test } from "bun:test";
import { formatWireframe, lintWireframe } from "../../src/core";
import { uglyInputFixtures } from "../fixtures/ugly-inputs";

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

  test("normalizes a single box with uneven interior spacing", () => {
    const input = "+----+\n|  x|\n+----+\n";

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

  test("normalizes a box with mixed indentation in a content row", () => {
    const input = " +--+\n  |x|\n +--+\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: " +---+\n | x |\n +---+\n",
      changed: true,
      warnings: [],
    });
  });

  test("formats multiple independent box blocks in one input", () => {
    const input = "+--+\n|a|\n+--+\n\n+--+\n|b|\n+--+\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: "+---+\n| a |\n+---+\n\n+---+\n| b |\n+---+\n",
      changed: true,
      warnings: [],
    });
  });

  test("formats exactly two sibling boxes in one block with independent widths", () => {
    const result = formatWireframe(uglyInputFixtures.supportedAdjacentBoxes, {
      pad: 1,
      width: 10,
    });

    expect(result).toEqual({
      formattedText:
        "+--------+ +--------+\n| a      | | bb     |\n+--------+ +--------+\n",
      changed: true,
      warnings: [],
    });
  });

  test("preserves supported wider gaps between sibling boxes", () => {
    const result = formatWireframe(
      uglyInputFixtures.supportedAdjacentBoxesThreeSpaces,
      {
        pad: 1,
        width: 10,
      },
    );

    expect(result).toEqual({
      formattedText:
        "+--------+   +--------+\n| a      |   | bb     |\n+--------+   +--------+\n",
      changed: true,
      warnings: [],
    });
  });

  test("supports the bounded two-space gap between sibling boxes", () => {
    const input = "+---+  +----+\n| a |  | bb |\n+---+  +----+\n";

    const result = formatWireframe(input, {
      pad: 1,
      width: 10,
    });

    expect(result).toEqual({
      formattedText:
        "+--------+  +--------+\n| a      |  | bb     |\n+--------+  +--------+\n",
      changed: true,
      warnings: [],
    });
  });

  test("formats exactly three sibling boxes in one block with preserved gaps", () => {
    const result = formatWireframe(
      uglyInputFixtures.supportedThreeSiblingBoxes,
      {
        pad: 1,
        width: 10,
      },
    );

    expect(result).toEqual({
      formattedText:
        "+--------+ +--------+   +--------+\n| a      | | bb     |   | c      |\n+--------+ +--------+   +--------+\n",
      changed: true,
      warnings: [],
    });
  });

  test("uses the minimum width when width is omitted and expands when needed", () => {
    const input = "+---+\n|x|\n+---+\n";

    const defaultWidth = formatWireframe(input, {
      pad: 1,
    });
    const smallerWidth = formatWireframe(input, {
      pad: 1,
      width: 4,
    });
    const largerWidth = formatWireframe(input, {
      pad: 1,
      width: 10,
    });

    expect(defaultWidth.formattedText).toBe("+---+\n| x |\n+---+\n");
    expect(smallerWidth.formattedText).toBe("+---+\n| x |\n+---+\n");
    expect(largerWidth.formattedText).toBe(
      "+--------+\n| x      |\n+--------+\n",
    );
    expect(defaultWidth.changed).toBe(true);
    expect(smallerWidth.changed).toBe(true);
    expect(largerWidth.changed).toBe(true);
  });

  test("passes unsupported multi-box layouts through unchanged with warnings", () => {
    const input = uglyInputFixtures.unsupportedMultiBoxLayout;

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "unsupported-box-columns",
          message:
            "Contains four or more sibling boxes or broader column layout.",
        },
      ],
    });
  });

  test("reports unsupported adjacent gaps with a stable diagnostic", () => {
    const input = uglyInputFixtures.unsupportedAdjacentGap;

    const formatResult = formatWireframe(input, {
      pad: 1,
    });
    const lintResult = lintWireframe(input, "fixture.txt");

    expect(formatResult).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "unsupported-adjacent-gap",
          message:
            "Adjacent sibling boxes must be separated by one to three literal spaces.",
        },
      ],
    });
    expect(lintResult.issues).toEqual([
      {
        code: "unsupported-adjacent-gap",
        message:
          "Adjacent sibling boxes must be separated by one to three literal spaces.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("passes near-miss adjacent layouts with gap text through unchanged", () => {
    const input = "+---+ +---+\n| a |x| b |\n+---+ +---+\n";

    const formatResult = formatWireframe(input, {
      pad: 1,
    });
    const lintResult = lintWireframe(input, "fixture.txt");

    expect(formatResult).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "unsupported-adjacent-gap",
          message:
            "Adjacent sibling boxes must be separated by one to three literal spaces.",
        },
      ],
    });
    expect(lintResult.issues).toEqual([
      {
        code: "unsupported-adjacent-gap",
        message:
          "Adjacent sibling boxes must be separated by one to three literal spaces.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("reports unsupported three-box gaps with a stable diagnostic", () => {
    const input = uglyInputFixtures.unsupportedThreeSiblingGap;

    const formatResult = formatWireframe(input, {
      pad: 1,
    });
    const lintResult = lintWireframe(input, "fixture.txt");

    expect(formatResult).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "unsupported-adjacent-gap",
          message:
            "Adjacent sibling boxes must be separated by one to three literal spaces.",
        },
      ],
    });
    expect(lintResult.issues).toEqual([
      {
        code: "unsupported-adjacent-gap",
        message:
          "Adjacent sibling boxes must be separated by one to three literal spaces.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("repairs a malformed box inside the supported sibling-box frame", () => {
    const result = lintWireframe(
      uglyInputFixtures.supportedAdjacentBoxesBrokenRight,
      "fixture.txt",
    );

    expect(result.issues).toEqual([
      {
        code: "broken-border",
        message: "Content row is missing a closing edge.",
        source: "fixture.txt",
        lineOrBlock: "2",
      },
    ]);
  });

  test("repairs a malformed box inside the supported three-box frame", () => {
    const result = lintWireframe(
      uglyInputFixtures.supportedThreeSiblingBoxesBrokenRight,
      "fixture.txt",
    );

    expect(result.issues).toEqual([
      {
        code: "broken-border",
        message: "Content row is missing a closing edge.",
        source: "fixture.txt",
        lineOrBlock: "2",
      },
    ]);
  });

  test("passes unsupported plain text through unchanged", () => {
    const input = "plain text\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: input,
      changed: false,
      warnings: [],
    });
  });

  test("keeps ambiguous partial box intent separate from unsupported layouts", () => {
    const input = "foo +--+\n|x|\n+--+\n";

    const result = formatWireframe(input, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "ambiguous-box",
          message: "Contains a non-border row without box edges.",
        },
      ],
    });
  });

  test("passes through text outside a detected box with a stable diagnostic", () => {
    const input = uglyInputFixtures.textOutsideBox;

    const formatResult = formatWireframe(input, {
      pad: 1,
    });
    const lintResult = lintWireframe(input, "fixture.txt");

    expect(formatResult).toEqual({
      formattedText: input,
      changed: false,
      warnings: [
        {
          code: "text-outside-box",
          message: "Contains text outside the detected box.",
        },
      ],
    });
    expect(lintResult.issues).toEqual([
      {
        code: "text-outside-box",
        message: "Contains text outside the detected box.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
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
      uglyInputFixtures.unsupportedMultiBoxLayout,
      "fixture.txt",
    );

    expect(result.issues).toEqual([
      {
        code: "unsupported-box-columns",
        message:
          "Contains four or more sibling boxes or broader column layout.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("reports unsupported adjacent stagger and interior border cases distinctly", () => {
    const staggered = lintWireframe(
      uglyInputFixtures.unsupportedAdjacentStagger,
      "fixture.txt",
    );
    const interiorBorder = lintWireframe(
      uglyInputFixtures.unsupportedInteriorBorder,
      "fixture.txt",
    );

    expect(staggered.issues).toEqual([
      {
        code: "unsupported-adjacent-stagger",
        message: "Adjacent sibling boxes must share the same row structure.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
    expect(interiorBorder.issues).toEqual([
      {
        code: "unsupported-interior-border",
        message: "Contains interior border rows.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
  });

  test("reports missing top and bottom borders on partial boxes", () => {
    const missingTop = lintWireframe("|x|\n+--+\n", "fixture.txt").issues;
    const missingBottom = lintWireframe("+--+\n|x|\n", "fixture.txt").issues;

    expect(missingTop).toContainEqual({
      code: "broken-border",
      message: "Top and bottom borders must both be present.",
      source: "fixture.txt",
      lineOrBlock: "1",
    });
    expect(missingTop).toContainEqual({
      code: "uneven-width",
      message: "Rows do not agree on a single box width.",
      source: "fixture.txt",
      lineOrBlock: "1",
    });

    expect(missingBottom).toContainEqual({
      code: "broken-border",
      message: "Top and bottom borders must both be present.",
      source: "fixture.txt",
      lineOrBlock: "1",
    });
    expect(missingBottom).toContainEqual({
      code: "uneven-width",
      message: "Rows do not agree on a single box width.",
      source: "fixture.txt",
      lineOrBlock: "1",
    });
  });

  test("does not flag literal pipe characters inside valid box content", () => {
    const result = lintWireframe(
      "+-------+\n| A | B |\n+-------+\n",
      "fixture.txt",
    );

    expect(result.issues).toEqual([]);
  });
});
