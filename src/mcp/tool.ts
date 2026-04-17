import { DEFAULT_PAD, formatWireframe, lintWireframe } from "../core";
import type {
  WirefmtFormatToolInput,
  WirefmtFormatToolResult,
  WirefmtLintToolInput,
  WirefmtLintToolResult,
} from "./types";

const DEFAULT_LINT_SOURCE = "<stdin>";

export function runWirefmtFormatTool(
  input: WirefmtFormatToolInput,
): WirefmtFormatToolResult {
  const result = formatWireframe(input.text, buildFormatOptions(input));

  return {
    formattedText: result.formattedText,
    changed: result.changed,
    ...(result.warnings.length > 0 ? { warnings: result.warnings } : {}),
  };
}

export function runWirefmtLintTool(
  input: WirefmtLintToolInput,
): WirefmtLintToolResult {
  const result = lintWireframe(input.text, input.source ?? DEFAULT_LINT_SOURCE);

  return {
    issues: result.issues,
  };
}

function buildFormatOptions(input: WirefmtFormatToolInput) {
  return {
    pad: input.pad ?? DEFAULT_PAD,
    ...(input.width === undefined ? {} : { width: input.width }),
  };
}
