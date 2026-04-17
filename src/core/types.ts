export const DEFAULT_PAD = 1;

export interface FormatOptions {
  readonly width?: number;
  readonly pad: number;
}

export interface FormatWarning {
  readonly code: string;
  readonly message: string;
}

export interface FormatResult {
  readonly formattedText: string;
  readonly changed: boolean;
  readonly warnings: readonly FormatWarning[];
}

export type LintIssueCode =
  | "ambiguous-box"
  | "broken-border"
  | "misaligned-edge"
  | "uneven-width"
  | "unsupported-layout";

export interface LintIssue {
  readonly code: LintIssueCode;
  readonly message: string;
  readonly source: string;
  readonly lineOrBlock: string;
}

export interface LintResult {
  readonly issues: readonly LintIssue[];
}
