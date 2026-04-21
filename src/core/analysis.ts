import {
  detectUnsupportedAdjacentSiblingLayout,
  type ObservedLine,
} from "./conservative-diagnostics";
import type { WireframeBlock } from "./document";
import type {
  DiagnosticCode,
  FormatOptions,
  FormatWarning,
  LintIssueCode,
} from "./types";

interface InternalIssue {
  readonly code: LintIssueCode;
  readonly message: string;
  readonly lineOrBlock: string;
}

type BoxRenderRow =
  | { readonly kind: "content"; readonly content: string }
  | { readonly kind: "divider" };

export interface AnalyzedBlock {
  readonly lines: readonly string[];
  readonly warnings: readonly FormatWarning[];
  readonly issues: readonly InternalIssue[];
}

export function analyzeWireframeBlock(
  block: WireframeBlock,
  options: FormatOptions,
): AnalyzedBlock {
  const observed = block.lines.map((raw, index) => {
    return {
      raw,
      lineNumber: block.startLine + index,
      pluses: findCharacterPositions(raw, "+"),
      pipes: findCharacterPositions(raw, "|"),
    } satisfies ObservedLine;
  });

  if (!hasBorderIntent(observed) || !hasPipeIntent(observed)) {
    return passthrough(block);
  }

  const threeSiblingFrame = detectSupportedThreeSiblingFrame(observed);
  if (threeSiblingFrame !== undefined) {
    return analyzeSupportedAdjacentSiblingBoxes(
      block,
      threeSiblingFrame,
      options,
    );
  }

  const adjacentFrame = detectSupportedAdjacentSiblingFrame(observed);
  if (adjacentFrame !== undefined) {
    return analyzeSupportedAdjacentSiblingBoxes(block, adjacentFrame, options);
  }

  const unsupportedAdjacentLayout =
    detectUnsupportedAdjacentSiblingLayout(observed);
  if (unsupportedAdjacentLayout !== undefined) {
    return unsupportedLayout(
      block,
      unsupportedAdjacentLayout.code,
      unsupportedAdjacentLayout.message,
    );
  }

  if (observed.some((line) => line.pluses.length > 2)) {
    return unsupportedLayout(
      block,
      "unsupported-layout",
      "Contains multiple adjacent boxes or columns.",
    );
  }

  const borderIndexes = observed
    .map((line, index) => {
      return isBorderLikeLine(line) ? index : -1;
    })
    .filter((index) => index >= 0);

  if (borderIndexes.length === 0) {
    return ambiguousBox(
      block,
      "Looks box-like but the border shape is unclear.",
    );
  }

  if (hasUnsupportedInteriorBorderStructure(borderIndexes)) {
    return unsupportedLayout(
      block,
      "unsupported-interior-border",
      "Contains interior border rows.",
    );
  }

  const contentIndexes = observed
    .map((line, index) => {
      return isBorderLikeLine(line) ? -1 : index;
    })
    .filter((index) => index >= 0);

  if (contentIndexes.length === 0) {
    return ambiguousBox(block, "Missing box content rows.");
  }

  const edgeCandidates = collectEdgeCandidates(observed);
  if (edgeCandidates === undefined) {
    return ambiguousBox(block, "Unable to infer a stable box width.");
  }

  const issues: InternalIssue[] = [];
  const renderRows: BoxRenderRow[] = [];
  const innerWidths: number[] = [];
  const { leftEdge, rightEdge } = edgeCandidates;
  const topBorderPresent = borderIndexes.includes(0);
  const bottomBorderPresent = borderIndexes.includes(observed.length - 1);

  for (const [index, line] of observed.entries()) {
    if (!hasWhitespaceOnlyPrefix(line.raw, leftEdge)) {
      return unsupportedLayout(
        block,
        "text-outside-box",
        "Contains text outside the detected box.",
      );
    }

    if (isBorderLikeLine(line)) {
      if (line.pluses[0] !== leftEdge || line.pluses[1] !== rightEdge) {
        issues.push(
          createIssue(
            "broken-border",
            "Border corners are not aligned to the detected box.",
            line.lineNumber,
          ),
        );
      }

      const [firstPlus, lastPlus] = line.pluses;
      if (firstPlus !== undefined && lastPlus !== undefined) {
        innerWidths.push(lastPlus - firstPlus - 1);
      }

      if (index !== 0 && index !== observed.length - 1) {
        renderRows.push({ kind: "divider" });
      }
      continue;
    }

    const firstPipe = line.pipes[0];
    if (firstPipe === undefined) {
      return ambiguousBox(
        block,
        "Contains a non-border row without box edges.",
      );
    }

    const lastPipe = line.pipes.length < 2 ? undefined : line.pipes.at(-1);

    if (firstPipe !== leftEdge) {
      issues.push(
        createIssue(
          "misaligned-edge",
          "Left edge is not aligned with the rest of the block.",
          line.lineNumber,
        ),
      );
    }

    if (lastPipe === undefined) {
      issues.push(
        createIssue(
          "broken-border",
          "Content row is missing a closing edge.",
          line.lineNumber,
        ),
      );
    } else if (lastPipe !== rightEdge) {
      issues.push(
        createIssue(
          "misaligned-edge",
          "Right edge is not aligned with the rest of the block.",
          line.lineNumber,
        ),
      );
    }

    if (
      lastPipe !== undefined &&
      !hasWhitespaceOnlySuffix(line.raw, lastPipe)
    ) {
      return unsupportedLayout(
        block,
        "text-outside-box",
        "Contains text outside the detected box.",
      );
    }

    const content = extractContent(line.raw, firstPipe, lastPipe).trim();
    renderRows.push({ kind: "content", content });

    const observedInnerWidth = (lastPipe ?? rightEdge) - firstPipe - 1;
    if (observedInnerWidth > 0) {
      innerWidths.push(observedInnerWidth);
    }
  }

  if (!topBorderPresent || !bottomBorderPresent) {
    issues.push(
      createIssue(
        "broken-border",
        "Top and bottom borders must both be present.",
        block.startLine,
      ),
    );
  }

  if (new Set(innerWidths).size > 1) {
    issues.push(
      createIssue(
        "uneven-width",
        "Rows do not agree on a single box width.",
        block.startLine,
      ),
    );
  }

  const renderedLines = renderBoxLines(leftEdge, renderRows, options);

  return {
    lines: renderedLines,
    warnings: [],
    issues: dedupeIssues(issues),
  };
}

function analyzeSupportedAdjacentSiblingBoxes(
  block: WireframeBlock,
  frame: SupportedAdjacentSiblingFrame,
  options: FormatOptions,
): AnalyzedBlock {
  const leftBlock: WireframeBlock = {
    ...block,
    lines: block.lines.map((line) => line.slice(0, frame.splitStart)),
  };
  const rightBlock: WireframeBlock = {
    ...block,
    lines: block.lines.map((line) => line.slice(frame.splitEnd)),
  };

  const leftAnalysis = analyzeWireframeBlock(leftBlock, options);
  const rightAnalysis = analyzeWireframeBlock(rightBlock, options);

  return {
    lines: leftAnalysis.lines.map((line, index) => {
      return `${line}${rightAnalysis.lines[index] ?? ""}`;
    }),
    warnings: [...leftAnalysis.warnings, ...rightAnalysis.warnings],
    issues: dedupeIssues([...leftAnalysis.issues, ...rightAnalysis.issues]),
  };
}

function collectEdgeCandidates(
  lines: readonly ObservedLine[],
): { readonly leftEdge: number; readonly rightEdge: number } | undefined {
  const leftCandidates: number[] = [];
  const rightCandidates: number[] = [];

  for (const line of lines) {
    if (isBorderLikeLine(line)) {
      leftCandidates.push(line.pluses[0] ?? -1);
      rightCandidates.push(line.pluses[1] ?? -1);
      continue;
    }

    if (line.pipes.length >= 1) {
      leftCandidates.push(line.pipes[0] ?? -1);
    }

    const rightPipe = line.pipes.length < 2 ? undefined : line.pipes.at(-1);
    if (rightPipe !== undefined) {
      rightCandidates.push(rightPipe);
    }
  }

  const leftEdge = pickMode(leftCandidates, "min");
  const rightEdge = pickMode(rightCandidates, "max");
  if (
    leftEdge === undefined ||
    rightEdge === undefined ||
    rightEdge <= leftEdge
  ) {
    return undefined;
  }

  return { leftEdge, rightEdge };
}

interface SupportedAdjacentSiblingFrame {
  readonly splitStart: number;
  readonly splitEnd: number;
}

const MIN_SUPPORTED_ADJACENT_BOX_GAP = 1;
const MAX_SUPPORTED_ADJACENT_BOX_GAP = 3;

function detectSupportedAdjacentSiblingFrame(
  lines: readonly ObservedLine[],
): SupportedAdjacentSiblingFrame | undefined {
  const borderRows = lines
    .map((line, index) => {
      return { line, index };
    })
    .filter(({ line }) => isTwoBoxBorderLikeLine(line));

  if (borderRows.length < 2) {
    return undefined;
  }

  const topBorder = borderRows[0];
  const bottomBorder = borderRows.at(-1);
  if (
    topBorder === undefined ||
    bottomBorder === undefined ||
    topBorder.index === bottomBorder.index ||
    topBorder.index + 1 === bottomBorder.index ||
    !samePositions(topBorder.line.pluses, bottomBorder.line.pluses)
  ) {
    return undefined;
  }

  const [leftEdge, leftBoxRight, rightBoxLeft, rightEdge] =
    topBorder.line.pluses;
  if (
    leftEdge === undefined ||
    leftBoxRight === undefined ||
    rightBoxLeft === undefined ||
    rightEdge === undefined
  ) {
    return undefined;
  }

  const gapWidth = rightBoxLeft - leftBoxRight - 1;
  if (
    gapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    gapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP
  ) {
    return undefined;
  }

  for (const line of lines) {
    if (
      !hasWhitespaceOnlyPrefix(line.raw, leftEdge) ||
      !hasWhitespaceOnlySuffix(line.raw, rightEdge)
    ) {
      return undefined;
    }
  }

  for (const [index, line] of lines.entries()) {
    if (index === topBorder.index || index === bottomBorder.index) {
      if (
        !isTwoBoxBorderLikeLine(line) ||
        !samePositions(line.pluses, topBorder.line.pluses)
      ) {
        return undefined;
      }

      continue;
    }

    if (!hasSupportedSiblingContentRow(line.raw, [leftEdge, rightBoxLeft])) {
      return undefined;
    }

    if (
      !hasLiteralSpacesOnlyBetween(line.raw, leftBoxRight + 1, rightBoxLeft)
    ) {
      return undefined;
    }
  }

  return {
    splitStart: rightBoxLeft,
    splitEnd: leftBoxRight + 1,
  };
}

function detectSupportedThreeSiblingFrame(
  lines: readonly ObservedLine[],
): SupportedAdjacentSiblingFrame | undefined {
  const borderRows = lines
    .map((line, index) => {
      return { line, index };
    })
    .filter(({ line }) => isThreeBoxBorderLikeLine(line));

  if (borderRows.length < 2) {
    return undefined;
  }

  const topBorder = borderRows[0];
  const bottomBorder = borderRows.at(-1);
  if (
    topBorder === undefined ||
    bottomBorder === undefined ||
    topBorder.index === bottomBorder.index ||
    topBorder.index + 1 === bottomBorder.index ||
    !samePositions(topBorder.line.pluses, bottomBorder.line.pluses)
  ) {
    return undefined;
  }

  const [
    leftEdge,
    firstBoxRight,
    secondBoxLeft,
    secondBoxRight,
    thirdBoxLeft,
    rightEdge,
  ] = topBorder.line.pluses;
  if (
    leftEdge === undefined ||
    firstBoxRight === undefined ||
    secondBoxLeft === undefined ||
    secondBoxRight === undefined ||
    thirdBoxLeft === undefined ||
    rightEdge === undefined
  ) {
    return undefined;
  }

  const firstGapWidth = secondBoxLeft - firstBoxRight - 1;
  const secondGapWidth = thirdBoxLeft - secondBoxRight - 1;
  if (
    firstGapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    firstGapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP ||
    secondGapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    secondGapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP
  ) {
    return undefined;
  }

  for (const line of lines) {
    if (
      !hasWhitespaceOnlyPrefix(line.raw, leftEdge) ||
      !hasWhitespaceOnlySuffix(line.raw, rightEdge)
    ) {
      return undefined;
    }
  }

  for (const [index, line] of lines.entries()) {
    if (index === topBorder.index || index === bottomBorder.index) {
      if (
        !isThreeBoxBorderLikeLine(line) ||
        !samePositions(line.pluses, topBorder.line.pluses)
      ) {
        return undefined;
      }

      continue;
    }

    if (
      !hasSupportedSiblingContentRow(line.raw, [
        leftEdge,
        secondBoxLeft,
        thirdBoxLeft,
      ])
    ) {
      return undefined;
    }

    if (
      !hasLiteralSpacesOnlyBetween(
        line.raw,
        firstBoxRight + 1,
        secondBoxLeft,
      ) ||
      !hasLiteralSpacesOnlyBetween(line.raw, secondBoxRight + 1, thirdBoxLeft)
    ) {
      return undefined;
    }
  }

  return {
    splitStart: secondBoxLeft,
    splitEnd: firstBoxRight + 1,
  };
}

function isTwoBoxBorderLikeLine(line: ObservedLine): boolean {
  if (line.pluses.length !== 4) {
    return false;
  }

  const [leftEdge, leftBoxRight, rightBoxLeft, rightEdge] = line.pluses;
  if (
    leftEdge === undefined ||
    leftBoxRight === undefined ||
    rightBoxLeft === undefined ||
    rightEdge === undefined ||
    leftBoxRight - leftEdge < 2 ||
    rightEdge - rightBoxLeft < 2
  ) {
    return false;
  }

  const gapWidth = rightBoxLeft - leftBoxRight - 1;
  if (
    gapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    gapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP
  ) {
    return false;
  }

  if (
    !hasWhitespaceOnlyPrefix(line.raw, leftEdge) ||
    !hasWhitespaceOnlySuffix(line.raw, rightEdge)
  ) {
    return false;
  }

  const leftBetween = line.raw.slice(leftEdge + 1, leftBoxRight);
  const rightBetween = line.raw.slice(rightBoxLeft + 1, rightEdge);

  return (
    leftBetween.includes("-") &&
    /^[ -]+$/.test(leftBetween) &&
    hasLiteralSpacesOnlyBetween(line.raw, leftBoxRight + 1, rightBoxLeft) &&
    rightBetween.includes("-") &&
    /^[ -]+$/.test(rightBetween)
  );
}

function isThreeBoxBorderLikeLine(line: ObservedLine): boolean {
  if (line.pluses.length !== 6) {
    return false;
  }

  const [
    leftEdge,
    firstBoxRight,
    secondBoxLeft,
    secondBoxRight,
    thirdBoxLeft,
    rightEdge,
  ] = line.pluses;
  if (
    leftEdge === undefined ||
    firstBoxRight === undefined ||
    secondBoxLeft === undefined ||
    secondBoxRight === undefined ||
    thirdBoxLeft === undefined ||
    rightEdge === undefined ||
    firstBoxRight - leftEdge < 2 ||
    secondBoxRight - secondBoxLeft < 2 ||
    rightEdge - thirdBoxLeft < 2
  ) {
    return false;
  }

  const firstGapWidth = secondBoxLeft - firstBoxRight - 1;
  const secondGapWidth = thirdBoxLeft - secondBoxRight - 1;
  if (
    firstGapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    firstGapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP ||
    secondGapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    secondGapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP
  ) {
    return false;
  }

  if (
    !hasWhitespaceOnlyPrefix(line.raw, leftEdge) ||
    !hasWhitespaceOnlySuffix(line.raw, rightEdge)
  ) {
    return false;
  }

  const firstBetween = line.raw.slice(leftEdge + 1, firstBoxRight);
  const secondBetween = line.raw.slice(secondBoxLeft + 1, secondBoxRight);
  const thirdBetween = line.raw.slice(thirdBoxLeft + 1, rightEdge);

  return (
    firstBetween.includes("-") &&
    /^[ -]+$/.test(firstBetween) &&
    hasLiteralSpacesOnlyBetween(line.raw, firstBoxRight + 1, secondBoxLeft) &&
    secondBetween.includes("-") &&
    /^[ -]+$/.test(secondBetween) &&
    hasLiteralSpacesOnlyBetween(line.raw, secondBoxRight + 1, thirdBoxLeft) &&
    thirdBetween.includes("-") &&
    /^[ -]+$/.test(thirdBetween)
  );
}

function hasSupportedSiblingContentRow(
  raw: string,
  leftEdges: readonly number[],
): boolean {
  return leftEdges.every((edge) => raw[edge] === "|");
}

function samePositions(
  left: readonly number[],
  right: readonly number[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function renderBoxLines(
  leftEdge: number,
  rows: readonly BoxRenderRow[],
  options: FormatOptions,
): readonly string[] {
  const indent = " ".repeat(leftEdge);
  const minimumOuterWidth =
    Math.max(
      ...rows
        .filter((row): row is Extract<BoxRenderRow, { kind: "content" }> => {
          return row.kind === "content";
        })
        .map((row) => row.content.length),
      0,
    ) +
    options.pad * 2 +
    2;
  const outerWidth = Math.max(options.width ?? 0, minimumOuterWidth);
  const innerWidth = outerWidth - 2;
  const border = `${indent}+${"-".repeat(innerWidth)}+`;

  const renderedRows = rows.map((row) => {
    if (row.kind === "divider") {
      return border;
    }

    const trailingSpaces = innerWidth - options.pad - row.content.length;
    return `${indent}|${" ".repeat(options.pad)}${row.content}${" ".repeat(
      trailingSpaces,
    )}|`;
  });

  return [border, ...renderedRows, border];
}

function hasUnsupportedInteriorBorderStructure(
  borderIndexes: readonly number[],
): boolean {
  if (borderIndexes.length === 0) {
    return false;
  }

  if (
    borderIndexes.some((index, position) => {
      if (position === 0 || position === borderIndexes.length - 1) {
        return false;
      }

      const previousIndex = borderIndexes[position - 1];
      const nextIndex = borderIndexes[position + 1];
      return (
        previousIndex !== undefined &&
        nextIndex !== undefined &&
        (index !== previousIndex + 2 || index !== nextIndex - 2)
      );
    })
  ) {
    return true;
  }

  return borderIndexes.some((index, position) => {
    const previousIndex = borderIndexes[position - 1];
    return previousIndex !== undefined && index === previousIndex + 1;
  });
}

function passthrough(block: WireframeBlock): AnalyzedBlock {
  return {
    lines: block.lines,
    warnings: [],
    issues: [],
  };
}

function ambiguousBox(block: WireframeBlock, message: string): AnalyzedBlock {
  return {
    lines: block.lines,
    warnings: [createWarning("ambiguous-box", message)],
    issues: [createIssue("ambiguous-box", message, block.startLine)],
  };
}

function unsupportedLayout(
  block: WireframeBlock,
  code: DiagnosticCode,
  message: string,
): AnalyzedBlock {
  return {
    lines: block.lines,
    warnings: [createWarning(code, message)],
    issues: [createIssue(code, message, block.startLine)],
  };
}

function hasBorderIntent(lines: readonly ObservedLine[]): boolean {
  return lines.some((line) => {
    if (line.pluses.length < 2) {
      return false;
    }

    const firstPlus = line.pluses[0];
    const lastPlus = line.pluses.at(-1);
    if (
      firstPlus === undefined ||
      lastPlus === undefined ||
      lastPlus <= firstPlus
    ) {
      return false;
    }

    return line.raw.slice(firstPlus + 1, lastPlus).includes("-");
  });
}

function hasPipeIntent(lines: readonly ObservedLine[]): boolean {
  return lines.some((line) => line.pipes.length > 0);
}

function isBorderLikeLine(line: ObservedLine): boolean {
  if (line.pluses.length !== 2) {
    return false;
  }

  const [left, right] = line.pluses;
  if (left === undefined || right === undefined || right - left < 2) {
    return false;
  }

  if (
    !hasWhitespaceOnlyPrefix(line.raw, left) ||
    !hasWhitespaceOnlySuffix(line.raw, right)
  ) {
    return false;
  }

  const between = line.raw.slice(left + 1, right);
  return between.includes("-") && /^[ -]+$/.test(between);
}

function extractContent(
  raw: string,
  leftEdge: number,
  rightEdge: number | undefined,
): string {
  const start = Math.min(leftEdge + 1, raw.length);
  const end =
    rightEdge === undefined ? raw.length : Math.min(rightEdge, raw.length);
  return raw.slice(start, end);
}

function hasWhitespaceOnlyPrefix(raw: string, edge: number): boolean {
  return /^\s*$/.test(raw.slice(0, Math.max(edge, 0)));
}

function hasWhitespaceOnlySuffix(raw: string, edge: number): boolean {
  return /^\s*$/.test(raw.slice(edge + 1));
}

function hasLiteralSpacesOnlyBetween(
  raw: string,
  start: number,
  end: number,
): boolean {
  return /^ +$/.test(raw.slice(start, end));
}

function findCharacterPositions(
  text: string,
  character: string,
): readonly number[] {
  const positions: number[] = [];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === character) {
      positions.push(index);
    }
  }

  return positions;
}

function pickMode(
  values: readonly number[],
  tieBreak: "min" | "max",
): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let bestValue: number | undefined;
  let bestCount = -1;

  for (const [value, count] of counts.entries()) {
    if (
      count > bestCount ||
      (count === bestCount &&
        bestValue !== undefined &&
        ((tieBreak === "min" && value < bestValue) ||
          (tieBreak === "max" && value > bestValue)))
    ) {
      bestValue = value;
      bestCount = count;
    }
  }

  return bestValue;
}

function dedupeIssues(
  issues: readonly InternalIssue[],
): readonly InternalIssue[] {
  const seen = new Set<string>();
  const deduped: InternalIssue[] = [];

  for (const issue of issues) {
    const key = `${issue.code}:${issue.lineOrBlock}:${issue.message}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(issue);
  }

  return deduped;
}

function createIssue(
  code: LintIssueCode,
  message: string,
  lineOrBlock: number,
): InternalIssue {
  return {
    code,
    message,
    lineOrBlock: `${lineOrBlock}`,
  };
}

function createWarning(code: DiagnosticCode, message: string): FormatWarning {
  return { code, message };
}
