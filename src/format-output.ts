import type { FormatWarning } from "./core";

export function formatWarningsText(warnings: readonly FormatWarning[]): string {
  return warnings
    .map((warning) => {
      return `warning: ${warning.code} ${warning.message}`;
    })
    .join("\n");
}
