import type { LintIssue } from "./core";

export function formatLintIssuesText(issues: readonly LintIssue[]): string {
  return issues
    .map((issue) => {
      return `${issue.source}:${issue.lineOrBlock}: ${issue.code} ${issue.message}`;
    })
    .join("\n");
}
