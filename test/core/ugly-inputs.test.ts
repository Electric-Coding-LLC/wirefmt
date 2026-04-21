import { describe, expect, test } from "bun:test";
import { formatWireframe, lintWireframe } from "../../src/core";
import { uglyInputFixtures } from "../fixtures/ugly-inputs";

describe("ugly input fixtures", () => {
  test("formats a messy draft while normalizing uneven spacing", () => {
    const result = formatWireframe(uglyInputFixtures.messySpacing, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: [
        "Draft note",
        "",
        "  +----+",
        "  | hi |",
        "  +----+",
        "",
        "Needs cleanup",
        "",
      ].join("\n"),
      changed: true,
      warnings: [],
    });
  });

  test("formats the supported two-box frame with independent widths", () => {
    const result = formatWireframe(uglyInputFixtures.supportedAdjacentBoxes, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: uglyInputFixtures.supportedAdjacentBoxes,
      changed: false,
      warnings: [],
    });
  });

  test("formats the supported wider-gap two-box frame without collapsing the gap", () => {
    const result = formatWireframe(
      uglyInputFixtures.supportedAdjacentBoxesThreeSpaces,
      {
        pad: 1,
      },
    );

    expect(result).toEqual({
      formattedText: uglyInputFixtures.supportedAdjacentBoxesThreeSpaces,
      changed: false,
      warnings: [],
    });
  });

  test("formats the supported three-box frame while preserving each gap", () => {
    const result = formatWireframe(
      uglyInputFixtures.supportedThreeSiblingBoxes,
      {
        pad: 1,
      },
    );

    expect(result).toEqual({
      formattedText: uglyInputFixtures.supportedThreeSiblingBoxes,
      changed: false,
      warnings: [],
    });
  });

  test("formats the supported compound-box frame while preserving divider rows", () => {
    const result = formatWireframe(uglyInputFixtures.supportedCompoundPanels, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: uglyInputFixtures.supportedCompoundPanels,
      changed: false,
      warnings: [],
    });
  });

  test("reports partial structure without expanding the supported scope", () => {
    const result = lintWireframe(
      uglyInputFixtures.partialStructure,
      "fixture.txt",
    );

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

  test("repairs and lints a malformed box inside the supported two-box frame", () => {
    const formatResult = formatWireframe(
      uglyInputFixtures.supportedAdjacentBoxesThreeSpacesBrokenRight,
      {
        pad: 1,
      },
    );
    const lintResult = lintWireframe(
      uglyInputFixtures.supportedAdjacentBoxesThreeSpacesBrokenRight,
      "fixture.txt",
    );

    expect(formatResult).toEqual({
      formattedText: "+---+   +----+\n| a |   | bb |\n+---+   +----+\n",
      changed: true,
      warnings: [],
    });
    expect(lintResult.issues).toEqual([
      {
        code: "broken-border",
        message: "Content row is missing a closing edge.",
        source: "fixture.txt",
        lineOrBlock: "2",
      },
    ]);
  });

  test("passes unsupported multi-box layouts through unchanged", () => {
    const result = formatWireframe(
      uglyInputFixtures.unsupportedMultiBoxLayout,
      {
        pad: 1,
      },
    );

    expect(result).toEqual({
      formattedText: uglyInputFixtures.unsupportedMultiBoxLayout,
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

  test("keeps unsupported adjacent gaps conservative with a specific warning", () => {
    const result = formatWireframe(uglyInputFixtures.unsupportedAdjacentGap, {
      pad: 1,
    });

    expect(result).toEqual({
      formattedText: uglyInputFixtures.unsupportedAdjacentGap,
      changed: false,
      warnings: [
        {
          code: "unsupported-adjacent-gap",
          message:
            "Adjacent sibling boxes must be separated by one to three literal spaces.",
        },
      ],
    });
  });

  test("keeps unsupported three-box gaps conservative with a specific warning", () => {
    const result = formatWireframe(
      uglyInputFixtures.unsupportedThreeSiblingGap,
      {
        pad: 1,
      },
    );

    expect(result).toEqual({
      formattedText: uglyInputFixtures.unsupportedThreeSiblingGap,
      changed: false,
      warnings: [
        {
          code: "unsupported-adjacent-gap",
          message:
            "Adjacent sibling boxes must be separated by one to three literal spaces.",
        },
      ],
    });
  });

  test("keeps interior border layouts conservative with a specific warning", () => {
    const result = formatWireframe(
      uglyInputFixtures.unsupportedInteriorBorder,
      {
        pad: 1,
      },
    );

    expect(result).toEqual({
      formattedText: uglyInputFixtures.unsupportedInteriorBorder,
      changed: false,
      warnings: [
        {
          code: "unsupported-interior-border",
          message: "Contains interior border rows.",
        },
      ],
    });
  });
});
