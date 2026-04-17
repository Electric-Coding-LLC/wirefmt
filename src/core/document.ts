export type LineEnding = "\n" | "\r\n" | "\r";

export interface WireframeBlock {
  readonly lines: readonly string[];
  readonly startLine: number;
  readonly endLine: number;
  readonly blankLinesBefore: number;
}

export interface WireframeDocument {
  readonly blocks: readonly WireframeBlock[];
  readonly leadingBlankLines: number;
  readonly trailingBlankLines: number;
  readonly lineEnding: LineEnding;
  readonly endsWithNewline: boolean;
}

const DEFAULT_LINE_ENDING: LineEnding = "\n";
const LINE_BREAK_PATTERN = /\r\n|[\n\r]/g;

function isBlankLine(line: string): boolean {
  return line.trim().length === 0;
}

function getLineEnding(text: string): LineEnding {
  const match = text.match(LINE_BREAK_PATTERN);
  if (match?.[0] === "\r\n" || match?.[0] === "\r") {
    return match[0];
  }
  return DEFAULT_LINE_ENDING;
}

function readLines(text: string): {
  readonly lines: readonly string[];
  readonly lineEnding: LineEnding;
  readonly endsWithNewline: boolean;
} {
  const lines: string[] = [];
  let cursor = 0;
  let lineEnding: LineEnding = DEFAULT_LINE_ENDING;
  let sawLineBreak = false;

  for (const match of text.matchAll(LINE_BREAK_PATTERN)) {
    lines.push(text.slice(cursor, match.index));
    if (!sawLineBreak) {
      lineEnding = getLineEnding(text);
      sawLineBreak = true;
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    lines.push(text.slice(cursor));
  }

  return {
    lines,
    lineEnding,
    endsWithNewline: sawLineBreak && cursor === text.length,
  };
}

export function parseWireframeDocument(text: string): WireframeDocument {
  const { lines, lineEnding, endsWithNewline } = readLines(text);
  const blocks: WireframeBlock[] = [];
  let pendingBlankLines = 0;
  let leadingBlankLines = 0;
  let lineNumber = 1;
  let index = 0;

  while (index < lines.length) {
    if (isBlankLine(lines[index] ?? "")) {
      pendingBlankLines += 1;
      index += 1;
      lineNumber += 1;
      continue;
    }

    const blockStartLine = lineNumber;
    const blockLines: string[] = [];
    const blankLinesBefore = blocks.length === 0 ? 0 : pendingBlankLines;

    if (blocks.length === 0) {
      leadingBlankLines = pendingBlankLines;
    }

    pendingBlankLines = 0;

    while (index < lines.length && !isBlankLine(lines[index] ?? "")) {
      blockLines.push(lines[index] ?? "");
      index += 1;
      lineNumber += 1;
    }

    blocks.push({
      lines: blockLines,
      startLine: blockStartLine,
      endLine: lineNumber - 1,
      blankLinesBefore,
    });
  }

  const trailingBlankLines = blocks.length === 0 ? 0 : pendingBlankLines;

  if (blocks.length === 0) {
    leadingBlankLines = pendingBlankLines;
  }

  return {
    blocks,
    leadingBlankLines,
    trailingBlankLines,
    lineEnding,
    endsWithNewline,
  };
}

export function serializeWireframeDocument(
  document: WireframeDocument,
): string {
  const physicalLines: string[] = [];

  for (let i = 0; i < document.leadingBlankLines; i += 1) {
    physicalLines.push("");
  }

  document.blocks.forEach((block, index) => {
    if (index > 0) {
      for (let i = 0; i < block.blankLinesBefore; i += 1) {
        physicalLines.push("");
      }
    }

    for (const line of block.lines) {
      physicalLines.push(line);
    }
  });

  for (let i = 0; i < document.trailingBlankLines; i += 1) {
    physicalLines.push("");
  }

  const text = physicalLines.join(document.lineEnding);
  return document.endsWithNewline && physicalLines.length > 0
    ? `${text}${document.lineEnding}`
    : text;
}
