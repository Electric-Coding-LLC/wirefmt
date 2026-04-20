import { describe, expect, test } from "bun:test";
import { runCli } from "../../src/cli/run";
import type { CliRuntime } from "../../src/cli/runtime";
import { formatLintIssuesText } from "../../src/lint-output";
import { runWirefmtFormatTool, runWirefmtLintTool } from "../../src/mcp";
import { WIREFMT_VERSION } from "../../src/version";
import { uglyInputFixtures } from "../fixtures/ugly-inputs";

describe("CLI and MCP parity", () => {
  test("formats the documented stdin example the same way through both interfaces", async () => {
    const input = "+---+\n|x|\n+---+\n";
    const runtime = createRuntime({
      stdin: input,
    });

    const exitCode = await runCli(
      ["format", "--width", "10", "--pad", "2"],
      runtime,
    );
    const toolResult = runWirefmtFormatTool({
      text: input,
      width: 10,
      pad: 2,
    });

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe(toolResult.formattedText);
    expect(runtime.stderr).toBe("");
    expect(toolResult).toEqual({
      formattedText: "+--------+\n|  x     |\n+--------+\n",
      changed: true,
    });
  });

  test("formats the supported sibling-box frame the same way through both interfaces", async () => {
    const input = uglyInputFixtures.supportedAdjacentBoxes;
    const runtime = createRuntime({
      stdin: input,
    });

    const exitCode = await runCli(
      ["format", "--width", "10", "--pad", "1"],
      runtime,
    );
    const toolResult = runWirefmtFormatTool({
      text: input,
      width: 10,
      pad: 1,
    });

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe(toolResult.formattedText);
    expect(runtime.stderr).toBe("");
    expect(toolResult).toEqual({
      formattedText:
        "+--------+ +--------+\n| a      | | bb     |\n+--------+ +--------+\n",
      changed: true,
    });
  });

  test("renders lint findings with the shared renderer and matching issue details", async () => {
    const input = uglyInputFixtures.partialStructure;
    const runtime = createRuntime({
      files: {
        "fixture.txt": input,
      },
    });

    const exitCode = await runCli(
      ["lint", "--width", "10", "--pad", "2", "fixture.txt"],
      runtime,
    );
    const toolResult = runWirefmtLintTool({
      text: input,
      source: "fixture.txt",
    });

    expect(exitCode).toBe(1);
    expect(toolResult.issues).toEqual([
      {
        code: "broken-border",
        message: "Content row is missing a closing edge.",
        source: "fixture.txt",
        lineOrBlock: "2",
      },
      {
        code: "broken-border",
        message: "Border corners are not aligned to the detected box.",
        source: "fixture.txt",
        lineOrBlock: "3",
      },
      {
        code: "uneven-width",
        message: "Rows do not agree on a single box width.",
        source: "fixture.txt",
        lineOrBlock: "1",
      },
    ]);
    expect(runtime.stdout).toBe(`${formatLintIssuesText(toolResult.issues)}\n`);
    expect(runtime.stderr).toBe("");
  });

  test("renders lint findings for a malformed box inside the supported pair", async () => {
    const input = uglyInputFixtures.supportedAdjacentBoxesBrokenRight;
    const runtime = createRuntime({
      files: {
        "fixture.txt": input,
      },
    });

    const exitCode = await runCli(["lint", "fixture.txt"], runtime);
    const toolResult = runWirefmtLintTool({
      text: input,
      source: "fixture.txt",
    });

    expect(exitCode).toBe(1);
    expect(toolResult.issues).toEqual([
      {
        code: "broken-border",
        message: "Content row is missing a closing edge.",
        source: "fixture.txt",
        lineOrBlock: "2",
      },
    ]);
    expect(runtime.stdout).toBe(`${formatLintIssuesText(toolResult.issues)}\n`);
    expect(runtime.stderr).toBe("");
  });

  test("stays conservative for plain text and unsupported multi-box layouts", async () => {
    const plainText = "plain text\n";
    const multiBox = "+--+   +--+\n|a|   |b|\n+--+   +--+\n";

    const plainRuntime = createRuntime({
      stdin: plainText,
    });
    const plainExitCode = await runCli(["format"], plainRuntime);
    const plainFormatResult = runWirefmtFormatTool({
      text: plainText,
    });
    const plainLintRuntime = createRuntime({
      stdin: plainText,
    });
    const plainLintExitCode = await runCli(["lint"], plainLintRuntime);
    const plainLintResult = runWirefmtLintTool({
      text: plainText,
    });

    expect(plainExitCode).toBe(0);
    expect(plainRuntime.stdout).toBe(plainText);
    expect(plainRuntime.stderr).toBe("");
    expect(plainFormatResult).toEqual({
      formattedText: plainText,
      changed: false,
    });
    expect(plainLintExitCode).toBe(0);
    expect(plainLintRuntime.stdout).toBe("");
    expect(plainLintRuntime.stderr).toBe("");
    expect(plainLintResult).toEqual({
      issues: [],
    });

    const multiBoxRuntime = createRuntime({
      stdin: multiBox,
    });
    const multiBoxExitCode = await runCli(["format"], multiBoxRuntime);
    const multiBoxFormatResult = runWirefmtFormatTool({
      text: multiBox,
    });
    const multiBoxLintResult = runWirefmtLintTool({
      text: multiBox,
    });

    expect(multiBoxExitCode).toBe(0);
    expect(multiBoxRuntime.stdout).toBe(multiBox);
    expect(multiBoxRuntime.stderr).toBe("");
    expect(multiBoxFormatResult).toEqual({
      formattedText: multiBox,
      changed: false,
      warnings: [
        {
          code: "unsupported-layout",
          message: "Contains multiple adjacent boxes or columns.",
        },
      ],
    });
    expect(multiBoxLintResult).toEqual({
      issues: [
        {
          code: "unsupported-layout",
          message: "Contains multiple adjacent boxes or columns.",
          source: "<stdin>",
          lineOrBlock: "1",
        },
      ],
    });
  });

  test("prints the documented version string for the release smoke check", async () => {
    const runtime = createRuntime();

    const exitCode = await runCli(["--version"], runtime);

    expect(exitCode).toBe(0);
    expect(runtime.stdout).toBe(`${WIREFMT_VERSION}\n`);
    expect(runtime.stderr).toBe("");
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
