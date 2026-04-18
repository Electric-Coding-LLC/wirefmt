#!/usr/bin/env bun

import { runMcpCli } from "./run";

const exitCode = await runMcpCli(process.argv.slice(2));
process.exit(exitCode);
