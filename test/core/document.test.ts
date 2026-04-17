import { describe, expect, test } from "bun:test";
import {
  parseWireframeDocument,
  serializeWireframeDocument,
} from "../../src/core/document";

describe("parseWireframeDocument", () => {
  test("returns an empty document for empty input", () => {
    const document = parseWireframeDocument("");

    expect(document).toEqual({
      blocks: [],
      leadingBlankLines: 0,
      trailingBlankLines: 0,
      lineEnding: "\n",
      endsWithNewline: false,
    });
    expect(serializeWireframeDocument(document)).toBe("");
  });

  test("preserves a trailing newline without inventing a blank block", () => {
    const document = parseWireframeDocument("solo\n");

    expect(document).toEqual({
      blocks: [
        {
          lines: ["solo"],
          startLine: 1,
          endLine: 1,
          blankLinesBefore: 0,
        },
      ],
      leadingBlankLines: 0,
      trailingBlankLines: 0,
      lineEnding: "\n",
      endsWithNewline: true,
    });
    expect(serializeWireframeDocument(document)).toBe("solo\n");
  });

  test("preserves blank-only input as leading blank lines", () => {
    const document = parseWireframeDocument("\n\n");

    expect(document).toEqual({
      blocks: [],
      leadingBlankLines: 2,
      trailingBlankLines: 0,
      lineEnding: "\n",
      endsWithNewline: true,
    });
    expect(serializeWireframeDocument(document)).toBe("\n\n");
  });

  test("splits blocks on blank runs and preserves source line numbers", () => {
    const input = "alpha\nbeta\n\n\ngamma\n";
    const document = parseWireframeDocument(input);

    expect(document).toEqual({
      blocks: [
        {
          lines: ["alpha", "beta"],
          startLine: 1,
          endLine: 2,
          blankLinesBefore: 0,
        },
        {
          lines: ["gamma"],
          startLine: 5,
          endLine: 5,
          blankLinesBefore: 2,
        },
      ],
      leadingBlankLines: 0,
      trailingBlankLines: 0,
      lineEnding: "\n",
      endsWithNewline: true,
    });
    expect(serializeWireframeDocument(document)).toBe(input);
  });

  test("stores leading blank lines only at the document level", () => {
    const input = "\n\nalpha\n\nbeta\n";
    const document = parseWireframeDocument(input);

    expect(document).toEqual({
      blocks: [
        {
          lines: ["alpha"],
          startLine: 3,
          endLine: 3,
          blankLinesBefore: 0,
        },
        {
          lines: ["beta"],
          startLine: 5,
          endLine: 5,
          blankLinesBefore: 1,
        },
      ],
      leadingBlankLines: 2,
      trailingBlankLines: 0,
      lineEnding: "\n",
      endsWithNewline: true,
    });
    expect(serializeWireframeDocument(document)).toBe(input);
  });
});
