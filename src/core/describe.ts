import { analyzeWireframeBlock } from "./analysis";
import { parseWireframeDocument } from "./document";
import type {
  DescribeBox,
  DescribeLayout,
  DescribePanel,
  DescribeResult,
  FormatWarning,
} from "./types";
import { DEFAULT_PAD } from "./types";

export function describeWireframe(text: string): DescribeResult {
  const document = parseWireframeDocument(text);
  const layouts: DescribeLayout[] = [];
  const warnings: FormatWarning[] = [];

  for (const block of document.blocks) {
    const analysis = analyzeWireframeBlock(block, {
      pad: DEFAULT_PAD,
    });

    warnings.push(...analysis.warnings);

    if (analysis.warnings.length > 0) {
      continue;
    }

    const layout = describeSupportedBlock(
      analysis.lines,
      block.startLine,
      block.startLine + analysis.lines.length - 1,
    );
    if (layout !== undefined) {
      layouts.push(layout);
    }
  }

  return {
    layouts,
    promptText: renderPromptText(layouts),
    warnings,
  };
}

function describeSupportedBlock(
  lines: readonly string[],
  startLine: number,
  endLine: number,
): DescribeLayout | undefined {
  const sibling = describeSiblingBoxes(lines, startLine, endLine);
  if (sibling !== undefined) {
    return sibling;
  }

  const borderIndexes = collectBorderIndexes(lines);
  if (borderIndexes.length < 2) {
    return undefined;
  }

  if (borderIndexes.length > 2) {
    return {
      kind: "compound-panel",
      startLine,
      endLine,
      panels: describePanels(lines, borderIndexes),
    };
  }

  return {
    kind: "single-box",
    startLine,
    endLine,
    label: collectSingleBoxLabel(lines, borderIndexes[0], borderIndexes[1]),
  };
}

function describeSiblingBoxes(
  lines: readonly string[],
  startLine: number,
  endLine: number,
): DescribeLayout | undefined {
  const firstBorder = lines.find((line) => findPositions(line, "+").length > 2);
  if (firstBorder === undefined) {
    return undefined;
  }

  const edgePositions = findPositions(firstBorder, "+");
  if (edgePositions.length !== 4 && edgePositions.length !== 6) {
    return undefined;
  }

  const boxes: DescribeBox[] = [];
  const gaps: number[] = [];
  const boxCount = edgePositions.length / 2;

  for (let index = 0; index < boxCount; index += 1) {
    const leftEdge = edgePositions[index * 2] ?? 0;
    const rightEdge = edgePositions[index * 2 + 1] ?? leftEdge;
    boxes.push({
      position: getBoxPosition(index, boxCount),
      label: collectBoxLabel(lines, leftEdge, rightEdge),
    });

    const nextLeftEdge = edgePositions[index * 2 + 2];
    if (nextLeftEdge !== undefined) {
      gaps.push(nextLeftEdge - rightEdge - 1);
    }
  }

  return {
    kind: "horizontal-sibling-boxes",
    startLine,
    endLine,
    boxes,
    gaps,
  };
}

function describePanels(
  lines: readonly string[],
  borderIndexes: readonly number[],
): readonly DescribePanel[] {
  const panels: DescribePanel[] = [];
  const panelCount = borderIndexes.length - 1;

  for (let index = 0; index < panelCount; index += 1) {
    panels.push({
      position: getPanelPosition(index, panelCount),
      label: collectSingleBoxLabel(
        lines,
        borderIndexes[index],
        borderIndexes[index + 1],
      ),
    });
  }

  return panels;
}

function collectSingleBoxLabel(
  lines: readonly string[],
  topBorder: number | undefined,
  bottomBorder: number | undefined,
): string {
  if (topBorder === undefined || bottomBorder === undefined) {
    return "";
  }

  const labels: string[] = [];
  for (let index = topBorder + 1; index < bottomBorder; index += 1) {
    const line = lines[index] ?? "";
    const pipes = findPositions(line, "|");
    const leftEdge = pipes[0];
    const rightEdge = pipes.at(-1);
    if (
      leftEdge === undefined ||
      rightEdge === undefined ||
      leftEdge === rightEdge
    ) {
      continue;
    }
    labels.push(line.slice(leftEdge + 1, rightEdge).trim());
  }

  return labels.filter((label) => label.length > 0).join(" ");
}

function collectBoxLabel(
  lines: readonly string[],
  leftEdge: number,
  rightEdge: number,
): string {
  const labels: string[] = [];

  for (const line of lines) {
    if (line[leftEdge] !== "|" || line[rightEdge] !== "|") {
      continue;
    }
    labels.push(line.slice(leftEdge + 1, rightEdge).trim());
  }

  return labels.filter((label) => label.length > 0).join(" ");
}

function collectBorderIndexes(lines: readonly string[]): readonly number[] {
  return lines
    .map((line, index) => {
      return isSingleBorderLine(line) ? index : -1;
    })
    .filter((index) => index >= 0);
}

function isSingleBorderLine(line: string): boolean {
  const pluses = findPositions(line, "+");
  const leftEdge = pluses[0];
  const rightEdge = pluses[1];
  return (
    leftEdge !== undefined &&
    rightEdge !== undefined &&
    pluses.length === 2 &&
    line.slice(leftEdge + 1, rightEdge).length > 0
  );
}

function getBoxPosition(index: number, count: number): DescribeBox["position"] {
  if (index === 0) {
    return "left";
  }
  if (index === count - 1) {
    return "right";
  }
  return "center";
}

function getPanelPosition(
  index: number,
  count: number,
): DescribePanel["position"] {
  if (index === 0) {
    return "top";
  }
  if (index === count - 1) {
    return "bottom";
  }
  return "middle";
}

function renderPromptText(layouts: readonly DescribeLayout[]): string {
  return layouts.map(renderLayoutPrompt).join("\n\n");
}

function renderLayoutPrompt(layout: DescribeLayout): string {
  if (layout.kind === "single-box") {
    return `A UI layout with one box labeled ${quoteLabel(layout.label)}.`;
  }

  if (layout.kind === "compound-panel") {
    const panels = layout.panels
      .map((panel) => {
        return `The ${panel.position} panel is labeled ${quoteLabel(panel.label)}.`;
      })
      .join(" ");

    return `A UI layout with one outer frame containing ${layout.panels.length} stacked panels separated by full-width horizontal dividers. ${panels}`;
  }

  const boxes = layout.boxes
    .map((box) => {
      return `The ${box.position} box is labeled ${quoteLabel(box.label)}.`;
    })
    .join(" ");

  return `A UI layout with ${layout.boxes.length} horizontal sibling boxes. ${boxes}`;
}

function quoteLabel(label: string): string {
  return JSON.stringify(label.length === 0 ? "unlabeled" : label);
}

function findPositions(text: string, character: string): readonly number[] {
  const positions: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === character) {
      positions.push(index);
    }
  }
  return positions;
}
