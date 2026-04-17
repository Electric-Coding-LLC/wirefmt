import { analyzeWireframeBlock } from "./analysis";
import { parseWireframeDocument, serializeWireframeDocument } from "./document";
import type {
  FormatOptions,
  FormatResult,
  FormatWarning,
  LintResult,
} from "./types";
import { DEFAULT_PAD } from "./types";

export function formatWireframe(
  text: string,
  options: FormatOptions,
): FormatResult {
  const document = parseWireframeDocument(text);
  const warnings: FormatWarning[] = [];
  const formattedBlocks = document.blocks.map((block) => {
    const analysis = analyzeWireframeBlock(block, options);
    warnings.push(...analysis.warnings);

    return {
      ...block,
      lines: analysis.lines,
      endLine: block.startLine + analysis.lines.length - 1,
    };
  });
  const formattedText = serializeWireframeDocument({
    ...document,
    blocks: formattedBlocks,
  });

  return {
    formattedText,
    changed: formattedText !== text,
    warnings,
  };
}

export function lintWireframe(text: string, source: string): LintResult {
  const document = parseWireframeDocument(text);
  const issues = document.blocks.flatMap((block) => {
    const analysis = analyzeWireframeBlock(block, {
      pad: DEFAULT_PAD,
    });

    return analysis.issues.map((issue) => {
      return {
        ...issue,
        source,
      };
    });
  });

  return {
    issues,
  };
}
