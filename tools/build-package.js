#!/usr/bin/env bun

import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, "dist");

async function buildEntry(entrypoint, outfile) {
  const result = Bun.spawnSync({
    cmd: [
      "bun",
      "build",
      "--target",
      "node",
      "--format",
      "esm",
      entrypoint,
      "--outfile",
      outfile,
    ],
    cwd: repoRoot,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "ignore",
    env: process.env,
  });

  if (result.exitCode !== 0) {
    throw new Error(`Failed to build ${entrypoint}`);
  }

  const bundled = await readFile(outfile, "utf8");
  const normalized = bundled.replace(
    /^#!\/usr\/bin\/env bun\n(?:\/\/ @bun\n)?\n?/,
    "",
  );
  if (normalized !== bundled) {
    await writeFile(outfile, normalized);
  }
}

await rm(distDir, { recursive: true, force: true });

await buildEntry(
  path.join(repoRoot, "src/cli/bin.ts"),
  path.join(distDir, "cli/bin.js"),
);
await buildEntry(
  path.join(repoRoot, "src/mcp/bin.ts"),
  path.join(distDir, "mcp/bin.js"),
);
