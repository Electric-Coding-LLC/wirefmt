export const DEFAULT_PAD = 1;

export interface FormatOptions {
  readonly width?: number;
  readonly pad: number;
}

export type DiagnosticCode =
  | "ambiguous-box"
  | "broken-border"
  | "misaligned-edge"
  | "text-outside-box"
  | "uneven-width"
  | "unsupported-adjacent-gap"
  | "unsupported-adjacent-stagger"
  | "unsupported-box-columns"
  | "unsupported-interior-border"
  | "unsupported-layout";

export interface FormatWarning {
  readonly code: DiagnosticCode;
  readonly message: string;
}

export interface FormatResult {
  readonly formattedText: string;
  readonly changed: boolean;
  readonly warnings: readonly FormatWarning[];
}

export type LintIssueCode = DiagnosticCode;

export interface LintIssue {
  readonly code: LintIssueCode;
  readonly message: string;
  readonly source: string;
  readonly lineOrBlock: string;
}

export interface LintResult {
  readonly issues: readonly LintIssue[];
}
