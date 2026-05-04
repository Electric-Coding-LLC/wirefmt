import { DEFAULT_PAD } from "../core";
import { WIREFMT_VERSION } from "../version";
import { CLI_USAGE } from "./help";

type CommandName = "format" | "lint" | "describe";

export interface ParsedArgs {
  readonly command: CommandName;
  readonly inputPath?: string;
  readonly width?: number;
  readonly pad: number;
}

export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

export function getVersionText(): string {
  return WIREFMT_VERSION;
}

export function getHelpText(): string {
  return CLI_USAGE;
}

export function parseCliArgs(
  argv: readonly string[],
): ParsedArgs | { readonly mode: "help" | "version" } {
  if (argv.length === 0) {
    throw new CliError("Missing command. Use --help for usage.");
  }

  if (argv.length === 1 && argv[0] === "--help") {
    return { mode: "help" };
  }

  if (argv.length === 1 && argv[0] === "--version") {
    return { mode: "version" };
  }

  const [command, ...rest] = argv;
  if (command !== "format" && command !== "lint" && command !== "describe") {
    throw new CliError(`Unknown command: ${command}`);
  }

  let inputPath: string | undefined;
  let width: number | undefined;
  let pad = DEFAULT_PAD;

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === undefined) {
      throw new CliError("Missing argument value.");
    }

    if (token === "--help") {
      return { mode: "help" };
    }

    if (token === "--version") {
      return { mode: "version" };
    }

    if (token === "--width") {
      if (command === "describe") {
        throw new CliError("--width is not supported for describe.");
      }
      width = parsePositiveInteger(rest[index + 1], "--width");
      index += 1;
      continue;
    }

    if (token === "--pad") {
      if (command === "describe") {
        throw new CliError("--pad is not supported for describe.");
      }
      pad = parsePositiveInteger(rest[index + 1], "--pad");
      index += 1;
      continue;
    }

    if (token.startsWith("--")) {
      throw new CliError(`Unknown flag: ${token}`);
    }

    if (inputPath !== undefined) {
      throw new CliError("Too many input paths provided.");
    }

    inputPath = token;
  }

  return buildParsedArgs(command, inputPath, width, pad);
}

function buildParsedArgs(
  command: CommandName,
  inputPath: string | undefined,
  width: number | undefined,
  pad: number,
): ParsedArgs {
  return {
    command,
    pad,
    ...(inputPath === undefined ? {} : { inputPath }),
    ...(width === undefined ? {} : { width }),
  };
}

function parsePositiveInteger(
  rawValue: string | undefined,
  flagName: string,
): number {
  if (rawValue === undefined) {
    throw new CliError(`Missing value for ${flagName}.`);
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new CliError(`Invalid value for ${flagName}: ${rawValue}`);
  }

  const value = Number.parseInt(rawValue, 10);
  if (value <= 0) {
    throw new CliError(`${flagName} must be greater than 0.`);
  }

  return value;
}
