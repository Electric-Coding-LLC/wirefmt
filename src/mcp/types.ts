import type { DescribeLayout, FormatWarning, LintIssue } from "../core";

export interface WirefmtFormatToolInput {
  readonly text: string;
  readonly width?: number;
  readonly pad?: number;
}

export interface WirefmtFormatToolResult {
  readonly [key: string]: unknown;
  readonly formattedText: string;
  readonly changed: boolean;
  readonly warnings?: readonly FormatWarning[];
}

export interface WirefmtLintToolInput {
  readonly text: string;
  readonly source?: string;
}

export interface WirefmtLintToolResult {
  readonly [key: string]: unknown;
  readonly issues: readonly LintIssue[];
}

export interface WirefmtDescribeToolInput {
  readonly text: string;
}

export interface WirefmtDescribeToolResult {
  readonly [key: string]: unknown;
  readonly layouts: readonly DescribeLayout[];
  readonly promptText: string;
  readonly warnings?: readonly FormatWarning[];
}
