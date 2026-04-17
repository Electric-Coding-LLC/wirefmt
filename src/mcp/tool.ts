import { DEFAULT_PAD, formatWireframe } from "../core";
import type { WirefmtFormatToolInput, WirefmtFormatToolResult } from "./types";

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

function buildFormatOptions(input: WirefmtFormatToolInput) {
  return {
    pad: input.pad ?? DEFAULT_PAD,
    ...(input.width === undefined ? {} : { width: input.width }),
  };
}
