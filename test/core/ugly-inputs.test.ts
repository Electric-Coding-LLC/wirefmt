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
          code: "unsupported-layout",
          message: "Contains multiple adjacent boxes or columns.",
        },
      ],
    });
  });
});
