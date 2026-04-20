import { describe, expect, test } from "bun:test";
import { runCli } from "../../src/cli/run";
import type { CliRuntime } from "../../src/cli/runtime";
import type { FormatOptions, FormatResult, LintResult } from "../../src/core";
import { formatWarningsText } from "../../src/format-output";

describe("runCli", () => {
  test("formats stdin with normalized output", async () => {
    const runtime = createRuntime({
      stdin: "+--+\n|x|\n+--+\n",
    });

    const exitCode = await runCli(["format"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe("+---+\n| x |\n+---+\n");
    expect(runtime.stderr).toBe("");
  });

  test("formats stdin and file input identically for the same document", async () => {
    const input = "Title\n\n +--+\n |x|\n +--+\n\nNotes\n";
    const stdinRuntime = createRuntime({
      stdin: input,
    });
    const fileRuntime = createRuntime({
      files: {
        "fixture.txt": input,
      },
    });

    const stdinExitCode = await runCli(["format"], stdinRuntime);
    const fileExitCode = await runCli(["format", "fixture.txt"], fileRuntime);

    expect(stdinExitCode).toBe(0);
    expect(fileExitCode).toBe(0);
    expect(stdinRuntime.stdout).toBe(
      "Title\n\n +---+\n | x |\n +---+\n\nNotes\n",
    );
    expect(fileRuntime.stdout).toBe(
      "Title\n\n +---+\n | x |\n +---+\n\nNotes\n",
    );
    expect(stdinRuntime.stderr).toBe("");
    expect(fileRuntime.stderr).toBe("");
  });

  test("formats file input with normalized output", async () => {
    const runtime = createRuntime({
      files: {
        "fixture.txt": "+--+\n|y|\n+--+\n",
      },
    });

    const exitCode = await runCli(["format", "fixture.txt"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe("+---+\n| y |\n+---+\n");
    expect(runtime.stderr).toBe("");
  });

  test("passes unsupported plain text through unchanged", async () => {
    const runtime = createRuntime({
      stdin: "plain text\n",
    });

    const exitCode = await runCli(["format"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe("plain text\n");
    expect(runtime.stderr).toBe("");
  });

  test("prints formatter warnings to stderr without changing the exit code", async () => {
    const runtime = createRuntime({
      stdin: "+--+    +--+\n|a|    |b|\n+--+    +--+\n",
    });

    const exitCode = await runCli(["format"], runtime, {
      format(text: string, _options: FormatOptions): FormatResult {
        return {
          formattedText: text,
          changed: false,
          warnings: [
            {
              code: "unsupported-layout",
              message: "Contains multiple adjacent boxes or columns.",
            },
          ],
        };
      },
      lint(_text: string, _source: string): LintResult {
        return {
          issues: [],
        };
      },
    });

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe("+--+    +--+\n|a|    |b|\n+--+    +--+\n");
    expect(runtime.stderr).toBe(
      `${formatWarningsText([
        {
          code: "unsupported-layout",
          message: "Contains multiple adjacent boxes or columns.",
        },
      ])}\n`,
    );
  });

  test("prints help with a zero exit code", async () => {
    const runtime = createRuntime();

    const exitCode = await runCli(["--help"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toContain("wirefmt format [file]");
    expect(runtime.stderr).toBe("");
  });

  test("reports invalid width as an operational error", async () => {
    const runtime = createRuntime();

    const exitCode = await runCli(["format", "--width", "abc"], runtime);

    expect(exitCode).toBe(2);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toContain("Invalid value for --width");
  });

  test("returns zero for lint when no issues are found", async () => {
    const runtime = createRuntime({
      files: {
        "clean.txt": "+---+\n| x |\n+---+\n",
      },
    });

    const exitCode = await runCli(["lint", "clean.txt"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toBe("");
  });

  test("returns one and prints findings for lint issues", async () => {
    const runtime = createRuntime({
      files: {
        "broken.txt": "+--+\n|x\n+--+\n",
      },
    });

    const exitCode = await runCli(["lint", "broken.txt"], runtime, {
      format(text: string, _options: FormatOptions): FormatResult {
        return {
          formattedText: text,
          changed: false,
          warnings: [],
        };
      },
      lint(_text: string, source: string): LintResult {
        return {
          issues: [
            {
              code: "broken-border",
              message: "Broken outer border.",
              source,
              lineOrBlock: "1",
            },
          ],
        };
      },
    });

    expect(exitCode).toBe(1);
    expect(runtime.stdout).toBe(
      "broken.txt:1: broken-border Broken outer border.\n",
    );
    expect(runtime.stderr).toBe("");
  });

  test("returns two for lint operational failures", async () => {
    const runtime = createRuntime();

    const exitCode = await runCli(["lint", "missing.txt"], runtime);

    expect(exitCode).toBe(2);
    expect(runtime.stdout).toBe("");
    expect(runtime.stderr).toContain("File not found: missing.txt");
  });
});

function createRuntime(values?: {
  readonly stdin?: string;
  readonly files?: Record<string, string>;
}): CliRuntime & { stdout: string; stderr: string } {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    async readFile(path) {
      const file = values?.files?.[path];
      if (file === undefined) {
        throw new Error(`File not found: ${path}`);
      }

      return file;
    },
    async readStdin() {
      return values?.stdin ?? "";
    },
    writeStdout(text) {
      stdout.push(text);
    },
    writeStderr(text) {
      stderr.push(text);
    },
    get stdout() {
      return stdout.join("");
    },
    get stderr() {
      return stderr.join("");
    },
  };
}
