import type { FormatOptions, FormatResult, LintResult } from "./types";

export function formatWireframe(
  text: string,
  _options: FormatOptions,
): FormatResult {
  return {
    formattedText: text,
    changed: false,
    warnings: [],
  };
}

export function lintWireframe(_text: string, _source: string): LintResult {
  return {
    issues: [],
  };
}
