import {
  type DescribeResult,
  describeWireframe,
  type FormatOptions,
  type FormatResult,
  formatWireframe,
  type LintResult,
  lintWireframe,
} from "../core";
import { formatWarningsText } from "../format-output";
import { formatLintIssuesText } from "../lint-output";
import {
  CliError,
  getHelpText,
  getVersionText,
  parseCliArgs,
} from "./parse-args";
import { type CliRuntime, defaultRuntime } from "./runtime";

interface CliHandlers {
  describe(text: string): DescribeResult;
  format(text: string, options: FormatOptions): FormatResult;
  lint(text: string, source: string): LintResult;
}

const defaultHandlers: CliHandlers = {
  describe: describeWireframe,
  format: formatWireframe,
  lint: lintWireframe,
};

export async function runCli(
  argv: readonly string[],
  runtime: CliRuntime = defaultRuntime,
  handlers: Partial<CliHandlers> = {},
): Promise<number> {
  try {
    const activeHandlers = {
      ...defaultHandlers,
      ...handlers,
    };
    const parsed = parseCliArgs(argv);

    if ("mode" in parsed) {
      const text =
        parsed.mode === "help" ? `${getHelpText()}\n` : `${getVersionText()}\n`;
      runtime.writeStdout(text);
      return 0;
    }

    const source = parsed.inputPath ?? "<stdin>";
    const text =
      parsed.inputPath === undefined
        ? await runtime.readStdin()
        : await runtime.readFile(parsed.inputPath);

    if (parsed.command === "format") {
      const result = activeHandlers.format(
        text,
        buildFormatOptions(parsed.width, parsed.pad),
      );
      runtime.writeStdout(result.formattedText);
      if (result.warnings.length > 0) {
        runtime.writeStderr(`${formatWarningsText(result.warnings)}\n`);
      }
      return 0;
    }

    if (parsed.command === "describe") {
      const result = activeHandlers.describe(text);
      runtime.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }

    const result = activeHandlers.lint(text, source);
    if (result.issues.length > 0) {
      runtime.writeStdout(`${formatLintIssuesText(result.issues)}\n`);
      return 1;
    }

    return 0;
  } catch (error) {
    const message =
      error instanceof CliError ? error.message : toErrorMessage(error);
    runtime.writeStderr(`${message}\n`);
    return 2;
  }
}

function buildFormatOptions(width: number | undefined, pad: number) {
  return {
    pad,
    ...(width === undefined ? {} : { width }),
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error.";
}
