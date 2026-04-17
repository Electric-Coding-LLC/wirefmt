#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function usage(exitCode = 1) {
  console.error(`Usage: bun run release -- <patch|minor|major|x.y.z> [--no-push]

Bumps the package version, runs the local release gate, creates a release commit
and tag, and optionally pushes both to trigger the GitHub release workflow.`);
  process.exit(exitCode);
}

function run(command, args, cwd = repoRoot) {
  const result = Bun.spawnSync({
    cmd: [command, ...args],
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
    env: process.env,
  });

  if (result.exitCode !== 0) {
    process.exit(result.exitCode ?? 1);
  }
}

function runQuiet(command, args, cwd = repoRoot) {
  return Bun.spawnSync({
    cmd: [command, ...args],
    cwd,
    stdout: "ignore",
    stderr: "ignore",
    stdin: "ignore",
    env: process.env,
  });
}

function parseArgs(argv) {
  if (argv.length === 0) {
    usage();
  }

  let bump = "";
  let noPush = false;

  for (const arg of argv) {
    if (arg === "--no-push") {
      noPush = true;
      continue;
    }

    if (arg === "-h" || arg === "--help") {
      usage(0);
    }

    if (bump) {
      fail(`unexpected extra argument "${arg}"`);
    }

    bump = arg;
  }

  if (!/^(patch|minor|major|\d+\.\d+\.\d+)$/.test(bump)) {
    fail(`invalid bump "${bump}"`);
  }

  return { bump, noPush };
}

function ensureCleanGit() {
  const worktree = runQuiet("git", [
    "diff",
    "--quiet",
    "--ignore-submodules",
    "HEAD",
  ]);
  if (worktree.exitCode !== 0) {
    fail("git worktree has uncommitted changes");
  }

  const index = runQuiet("git", [
    "diff",
    "--quiet",
    "--cached",
    "--ignore-submodules",
  ]);
  if (index.exitCode !== 0) {
    fail("git index has staged changes");
  }
}

function readPackageJson() {
  const packageJsonPath = path.join(repoRoot, "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf8"));
}

function smokeTestTarball(version) {
  const tarballName = `electric_coding-wirefmt-${version}.tgz`;
  const script = `
set -euo pipefail
find . -maxdepth 1 -name '*.tgz' -delete
bun pm pack
tmp_dir="$(mktemp -d)"
bun add --cwd "$tmp_dir" "$PWD/${tarballName}"
cd "$tmp_dir"
./node_modules/.bin/wirefmt --version
actual_output="$(printf '+--+\\n|x|\\n+--+\\n' | ./node_modules/.bin/wirefmt format)"
expected_output=$'+---+\\n| x |\\n+---+'
if [[ "$actual_output" != "$expected_output" ]]; then
  echo "unexpected wirefmt output"
  echo "expected:"
  printf '%s\\n' "$expected_output"
  echo "actual:"
  printf '%s\\n' "$actual_output"
  exit 1
fi
./node_modules/.bin/wirefmt-mcp </dev/null >/dev/null 2>&1 || true
rm -f "$PWD/${tarballName}"
`;

  run("bash", ["-lc", script], repoRoot);
}

const options = parseArgs(process.argv.slice(2));

ensureCleanGit();

console.log(`› npm version ${options.bump} --no-git-tag-version`);
run("npm", ["version", options.bump, "--no-git-tag-version"]);

const packageJson = readPackageJson();
const releaseTag = `v${packageJson.version}`;

console.log("› bun run check");
run("bun", ["run", "check"]);

console.log("› npm pack --dry-run");
run("npm", ["pack", "--dry-run"]);

console.log("› smoke-test packed install");
smokeTestTarball(packageJson.version);

console.log("› git add package.json");
run("git", ["add", "package.json"]);

console.log(`› git commit -m ${packageJson.name}@${packageJson.version}`);
run("git", ["commit", "-m", `${packageJson.name}@${packageJson.version}`]);

console.log(`› git tag ${releaseTag}`);
run("git", ["tag", releaseTag]);

if (options.noPush) {
  console.log("› Skipping git push (--no-push).");
  console.log(
    `  To publish later, run: git push && git push origin ${releaseTag}`,
  );
  process.exit(0);
}

console.log("› git push");
run("git", ["push"]);

console.log(`› git push origin ${releaseTag}`);
run("git", ["push", "origin", releaseTag]);

console.log(
  `› Release workflow will publish ${packageJson.name}@${packageJson.version} from tag ${releaseTag}.`,
);
