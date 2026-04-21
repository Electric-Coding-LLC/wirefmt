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
    lines.some((line) => line.pluses.length > 4) ||
    lines.some((line) => line.pipes.length > 4)
  ) {
    return {
      code: "unsupported-box-columns",
      message: "Contains three or more sibling boxes or broader column layout.",
    };
  }

  const borderRows = lines.filter((line) => line.pluses.length === 4);
  if (
    borderRows.length === 0 &&
    !lines.some((line) => line.pipes.length === 4)
  ) {
    return undefined;
  }

  const reference =
    borderRows[0]?.pluses ??
    findFirstPipeFrame(lines)?.map((value) => value) ??
    undefined;
  if (reference === undefined) {
    return {
      code: "unsupported-adjacent-stagger",
      message: "Adjacent sibling boxes must share the same row structure.",
    };
  }

  const [leftEdge, leftBoxRight, rightBoxLeft, rightEdge] = reference;
  if (
    leftEdge === undefined ||
    leftBoxRight === undefined ||
    rightBoxLeft === undefined ||
    rightEdge === undefined
  ) {
    return {
      code: "unsupported-adjacent-stagger",
      message: "Adjacent sibling boxes must share the same row structure.",
    };
  }

  if (
    borderRows.some((line) => !samePositions(line.pluses, reference)) ||
    lines.some(
      (line) =>
        line.pluses.length === 4 && !samePositions(line.pluses, reference),
    )
  ) {
    return {
      code: "unsupported-adjacent-stagger",
      message: "Adjacent sibling boxes must share the same row structure.",
    };
  }

  const gapWidth = rightBoxLeft - leftBoxRight - 1;
  if (
    gapWidth < MIN_SUPPORTED_ADJACENT_BOX_GAP ||
    gapWidth > MAX_SUPPORTED_ADJACENT_BOX_GAP
  ) {
    return {
      code: "unsupported-adjacent-gap",
      message:
        "Adjacent sibling boxes must be separated by one to three literal spaces.",
    };
  }

  for (const line of lines) {
    if (
      !hasWhitespaceOnlyPrefix(line.raw, leftEdge) ||
      !hasWhitespaceOnlySuffix(line.raw, rightEdge)
    ) {
      return {
        code: "text-outside-box",
        message: "Contains text outside the detected box.",
      };
    }

    if (line.pluses.length === 4) {
      continue;
    }

    if (
      line.raw[leftEdge] !== "|" ||
      line.raw[rightBoxLeft] !== "|" ||
      line.pipes.length < 4
    ) {
      return {
        code: "unsupported-adjacent-stagger",
        message: "Adjacent sibling boxes must share the same row structure.",
      };
    }

    if (
      !hasLiteralSpacesOnlyBetween(line.raw, leftBoxRight + 1, rightBoxLeft)
    ) {
      return {
        code: "unsupported-adjacent-gap",
        message:
          "Adjacent sibling boxes must be separated by one to three literal spaces.",
      };
    }
  }

  return {
    code: "unsupported-adjacent-stagger",
    message: "Adjacent sibling boxes must share the same row structure.",
  };
}

function findFirstPipeFrame(
  lines: readonly ObservedLine[],
): readonly number[] | undefined {
  for (const line of lines) {
    if (line.pipes.length === 4) {
      return line.pipes;
    }
  }

  return undefined;
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
