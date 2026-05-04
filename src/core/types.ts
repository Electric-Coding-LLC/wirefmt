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

export type DescribeLayout =
  | SingleBoxLayout
  | HorizontalSiblingBoxesLayout
  | CompoundPanelLayout;

export interface SingleBoxLayout {
  readonly kind: "single-box";
  readonly startLine: number;
  readonly endLine: number;
  readonly label: string;
}

export interface HorizontalSiblingBoxesLayout {
  readonly kind: "horizontal-sibling-boxes";
  readonly startLine: number;
  readonly endLine: number;
  readonly boxes: readonly DescribeBox[];
  readonly gaps: readonly number[];
}

export interface CompoundPanelLayout {
  readonly kind: "compound-panel";
  readonly startLine: number;
  readonly endLine: number;
  readonly panels: readonly DescribePanel[];
}

export interface DescribeBox {
  readonly position: "left" | "center" | "right";
  readonly label: string;
}

export interface DescribePanel {
  readonly position: "top" | "middle" | "bottom";
  readonly label: string;
}

export interface DescribeResult {
  readonly layouts: readonly DescribeLayout[];
  readonly promptText: string;
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
