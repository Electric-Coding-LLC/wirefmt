import type { DiagnosticCode } from "./types";

export interface ObservedLine {
  readonly raw: string;
  readonly lineNumber: number;
  readonly pluses: readonly number[];
  readonly pipes: readonly number[];
}

export interface ConservativeDiagnostic {
  readonly code: DiagnosticCode;
  readonly message: string;
}

const MIN_SUPPORTED_ADJACENT_BOX_GAP = 1;
const MAX_SUPPORTED_ADJACENT_BOX_GAP = 3;

export function detectUnsupportedAdjacentSiblingLayout(
  lines: readonly ObservedLine[],
): ConservativeDiagnostic | undefined {
  if (
    lines.some((line) => line.pluses.length > 6) ||
    lines.some((line) => line.pipes.length > 6)
  ) {
    return {
      code: "unsupported-box-columns",
      message: "Contains four or more sibling boxes or broader column layout.",
    };
  }

  return (
    detectUnsupportedSiblingLayout(lines, 3) ??
    detectUnsupportedSiblingLayout(lines, 2)
  );
}

function findFirstPipeFrame(
  lines: readonly ObservedLine[],
  positionCount: number,
): readonly number[] | undefined {
  for (const line of lines) {
    if (line.pipes.length === positionCount) {
      return line.pipes;
    }
  }

  return undefined;
}

function detectUnsupportedSiblingLayout(
  lines: readonly ObservedLine[],
  boxCount: 2 | 3,
): ConservativeDiagnostic | undefined {
  const positionCount = boxCount * 2;
  const borderRows = lines.filter(
    (line) => line.pluses.length === positionCount,
  );
  if (
    borderRows.length === 0 &&
    !lines.some((line) => line.pipes.length === positionCount)
  ) {
    return undefined;
  }

  const reference =
    borderRows[0]?.pluses ??
    findFirstPipeFrame(lines, positionCount)?.map((value) => value) ??
    undefined;
  if (reference === undefined) {
    return createAdjacentStaggerDiagnostic();
  }

  if (
    reference.some((value) => value === undefined) ||
    borderRows.some((line) => !samePositions(line.pluses, reference)) ||
    lines.some(
      (line) =>
        line.pluses.length === positionCount &&
        !samePositions(line.pluses, reference),
    )
  ) {
    return createAdjacentStaggerDiagnostic();
  }

  const leftEdges = reference.filter((_value, index) => index % 2 === 0);
  const gapPairs = reference
    .slice(1, -1)
    .map((value, index, values) => {
      if (index % 2 === 0) {
        return [value, values[index + 1]] as const;
      }

      return undefined;
    })
    .filter((value): value is readonly [number, number] => value !== undefined);
  const firstEdge = leftEdges[0];
  const lastEdge = reference.at(-1);
  if (firstEdge === undefined || lastEdge === undefined) {
    return createAdjacentStaggerDiagnostic();
  }

  for (const [leftBoundary, rightBoundary] of gapPairs) {
    const gapWidth = rightBoundary - leftBoundary - 1;
    if (
      gapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
      gapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP
    ) {
      return createAdjacentGapDiagnostic();
    }
  }

  for (const line of lines) {
    if (
      !hasWhitespaceOnlyPrefix(line.raw, firstEdge) ||
      !hasWhitespaceOnlySuffix(line.raw, lastEdge)
    ) {
      return {
        code: "text-outside-box",
        message: "Contains text outside the detected box.",
      };
    }

    if (line.pluses.length === positionCount) {
      continue;
    }

    if (!leftEdges.every((edge) => line.raw[edge] === "|")) {
      return createAdjacentStaggerDiagnostic();
    }

    for (const [leftBoundary, rightBoundary] of gapPairs) {
      if (
        !hasLiteralSpacesOnlyBetween(line.raw, leftBoundary + 1, rightBoundary)
      ) {
        return createAdjacentGapDiagnostic();
      }
    }
  }

  return createAdjacentStaggerDiagnostic();
}

function createAdjacentGapDiagnostic(): ConservativeDiagnostic {
  return {
    code: "unsupported-adjacent-gap",
    message:
      "Adjacent sibling boxes must be separated by one to three literal spaces.",
  };
}

function createAdjacentStaggerDiagnostic(): ConservativeDiagnostic {
  return {
    code: "unsupported-adjacent-stagger",
    message: "Adjacent sibling boxes must share the same row structure.",
  };
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
