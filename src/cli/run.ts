import {
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
  format(text: string, options: FormatOptions): FormatResult;
  lint(text: string, source: string): LintResult;
}

const defaultHandlers: CliHandlers = {
  format: formatWireframe,
  lint: lintWireframe,
};

export async function runCli(
  argv: readonly string[],
  runtime: CliRuntime = defaultRuntime,
  handlers: CliHandlers = defaultHandlers,
): Promise<number> {
  try {
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
      const result = handlers.format(
        text,
        buildFormatOptions(parsed.width, parsed.pad),
      );
      runtime.writeStdout(result.formattedText);
      if (result.warnings.length > 0) {
        runtime.writeStderr(`${formatWarningsText(result.warnings)}\n`);
      }
      return 0;
    }

    const result = handlers.lint(text, source);
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
