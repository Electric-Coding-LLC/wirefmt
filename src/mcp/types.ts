export interface WirefmtFormatToolInput {
  readonly text: string;
  readonly width?: number;
  readonly pad?: number;
}

export interface WirefmtFormatToolResult {
  readonly [key: string]: unknown;
  readonly formattedText: string;
  readonly changed: boolean;
  readonly warnings?: readonly {
    readonly code: string;
    readonly message: string;
  }[];
}
