import { describe, expect, test } from "bun:test";
import { runCli } from "../../src/cli/run";
import type { CliRuntime } from "../../src/cli/runtime";
import { formatWarningsText } from "../../src/format-output";
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

  test("formats the supported sibling-box frame with preserved gap the same way through both interfaces", async () => {
    const input = uglyInputFixtures.supportedAdjacentBoxesThreeSpaces;
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
        "+--------+   +--------+\n| a      |   | bb     |\n+--------+   +--------+\n",
      changed: true,
    });
  });

  test("formats the supported three-box frame the same way through both interfaces", async () => {
    const input = uglyInputFixtures.supportedThreeSiblingBoxes;
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
        "+--------+ +--------+   +--------+\n| a      | | bb     |   | c      |\n+--------+ +--------+   +--------+\n",
      changed: true,
    });
  });

  test("formats the supported compound-box frame the same way through both interfaces", async () => {
    const input = uglyInputFixtures.supportedCompoundPanels;
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
        "+--------+\n| top    |\n+--------+\n| mid    |\n+--------+\n| bot    |\n+--------+\n",
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
    const multiBox = uglyInputFixtures.unsupportedMultiBoxLayout;

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
    expect(multiBoxRuntime.stderr).toBe(
      `${formatWarningsText([
        {
          code: "unsupported-box-columns",
          message:
            "Contains four or more sibling boxes or broader column layout.",
        },
      ])}\n`,
    );
    expect(multiBoxFormatResult).toEqual({
      formattedText: multiBox,
      changed: false,
      warnings: [
        {
          code: "unsupported-box-columns",
          message:
            "Contains four or more sibling boxes or broader column layout.",
        },
      ],
    });
    expect(multiBoxLintResult).toEqual({
      issues: [
        {
          code: "unsupported-box-columns",
          message:
            "Contains four or more sibling boxes or broader column layout.",
          source: "<stdin>",
          lineOrBlock: "1",
        },
      ],
    });
  });

  test("keeps documented conservative diagnostics aligned across CLI and MCP", async () => {
    const cases = [
      {
        input: uglyInputFixtures.unsupportedAdjacentGap,
        expectedCode: "unsupported-adjacent-gap",
        expectedMessage:
          "Adjacent sibling boxes must be separated by one to three literal spaces.",
      },
      {
        input: uglyInputFixtures.unsupportedThreeSiblingGap,
        expectedCode: "unsupported-adjacent-gap",
        expectedMessage:
          "Adjacent sibling boxes must be separated by one to three literal spaces.",
      },
      {
        input: uglyInputFixtures.unsupportedAdjacentStagger,
        expectedCode: "unsupported-adjacent-stagger",
        expectedMessage:
          "Adjacent sibling boxes must share the same row structure.",
      },
      {
        input: uglyInputFixtures.unsupportedInteriorBorder,
        expectedCode: "unsupported-interior-border",
        expectedMessage: "Contains interior border rows.",
      },
      {
        input: uglyInputFixtures.textOutsideBox,
        expectedCode: "text-outside-box",
        expectedMessage: "Contains text outside the detected box.",
      },
    ] as const;

    for (const testCase of cases) {
      const runtime = createRuntime({
        stdin: testCase.input,
      });

      const exitCode = await runCli(["format"], runtime);
      const formatResult = runWirefmtFormatTool({
        text: testCase.input,
      });
      const lintResult = runWirefmtLintTool({
        text: testCase.input,
      });

      expect(exitCode).toBe(0);
      expect(runtime.stdout).toBe(testCase.input);
      expect(runtime.stderr).toBe(
        `${formatWarningsText([
          {
            code: testCase.expectedCode,
            message: testCase.expectedMessage,
          },
        ])}\n`,
      );
      expect(formatResult).toEqual({
        formattedText: testCase.input,
        changed: false,
        warnings: [
          {
            code: testCase.expectedCode,
            message: testCase.expectedMessage,
          },
        ],
      });
      expect(lintResult).toEqual({
        issues: [
          {
            code: testCase.expectedCode,
            message: testCase.expectedMessage,
            source: "<stdin>",
            lineOrBlock: "1",
          },
        ],
      });
    }
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
