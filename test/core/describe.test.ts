import { describe, expect, test } from "bun:test";
import { describeWireframe } from "../../src/core";
import { uglyInputFixtures } from "../fixtures/ugly-inputs";

describe("describeWireframe", () => {
  test("describes a single box with deterministic prompt text", () => {
    const result = describeWireframe("+--+\n|x|\n+--+\n");

    expect(result).toEqual({
      layouts: [
        {
          kind: "single-box",
          startLine: 1,
          endLine: 3,
          label: "x",
        },
      ],
      promptText: 'A UI layout with one box labeled "x".',
      warnings: [],
    });
  });

  test("describes supported sibling boxes with positions and gaps", () => {
    const result = describeWireframe(
      uglyInputFixtures.supportedThreeSiblingBoxes,
    );

    expect(result).toEqual({
      layouts: [
        {
          kind: "horizontal-sibling-boxes",
          startLine: 1,
          endLine: 3,
          boxes: [
            {
              position: "left",
              label: "a",
            },
            {
              position: "center",
              label: "bb",
            },
            {
              position: "right",
              label: "c",
            },
          ],
          gaps: [1, 3],
        },
      ],
      promptText:
        'A UI layout with 3 horizontal sibling boxes. The left box is labeled "a". The center box is labeled "bb". The right box is labeled "c".',
      warnings: [],
    });
  });

  test("describes compound panels with stacked panel positions", () => {
    const result = describeWireframe(uglyInputFixtures.supportedCompoundPanels);

    expect(result).toEqual({
      layouts: [
        {
          kind: "compound-panel",
          startLine: 1,
          endLine: 7,
          panels: [
            {
              position: "top",
              label: "top",
            },
            {
              position: "middle",
              label: "mid",
            },
            {
              position: "bottom",
              label: "bot",
            },
          ],
        },
      ],
      promptText:
        'A UI layout with one outer frame containing 3 stacked panels separated by full-width horizontal dividers. The top panel is labeled "top". The middle panel is labeled "mid". The bottom panel is labeled "bot".',
      warnings: [],
    });
  });

  test("keeps unsupported layouts diagnostic-only", () => {
    const result = describeWireframe(uglyInputFixtures.unsupportedAdjacentGap);

    expect(result).toEqual({
      layouts: [],
      promptText: "",
      warnings: [
        {
          code: "unsupported-adjacent-gap",
          message:
            "Adjacent sibling boxes must be separated by one to three literal spaces.",
        },
      ],
    });
  });
});
