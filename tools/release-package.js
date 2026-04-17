#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function usage(exitCode = 1) {
  console.error(`Usage: bun run release -- <patch|minor|major|x.y.z> [--no-push] [--push-tag]

Bumps the package version, runs the local release gate, creates a release commit
and tag, pushes the release commit by default, waits for CI on the default
branch to succeed, and then pushes the release tag unless --no-push or
--push-tag is provided.`);
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

function readStdout(command, args, cwd = repoRoot) {
  const result = Bun.spawnSync({
    cmd: [command, ...args],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
    env: process.env,
  });

  if (result.exitCode !== 0) {
    const stderr = result.stderr.toString().trim();
    fail(
      stderr.length > 0
        ? `${command} ${args.join(" ")} failed: ${stderr}`
        : `${command} ${args.join(" ")} failed`,
    );
  }

  return result.stdout.toString().trim();
}

async function sleep(milliseconds) {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function parseArgs(argv) {
  if (argv.length === 0) {
    usage();
  }

  let bump = "";
  let noPush = false;
  let pushTag = false;

  for (const arg of argv) {
    if (arg === "--no-push") {
      noPush = true;
      continue;
    }

    if (arg === "--push-tag") {
      pushTag = true;
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

  if (noPush && pushTag) {
    fail("--no-push cannot be combined with --push-tag");
  }

  return { bump, noPush, pushTag };
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

function getCurrentBranchName() {
  return readStdout("git", ["branch", "--show-current"]);
}

function getCurrentCommitSha() {
  return readStdout("git", ["rev-parse", "HEAD"]);
}

function getDefaultBranchName() {
  const remoteHead = readStdout("git", [
    "symbolic-ref",
    "--short",
    "refs/remotes/origin/HEAD",
  ]);

  return remoteHead.replace(/^origin\//, "");
}

function ensureGithubCliReady() {
  readStdout("gh", ["--version"]);
  readStdout("gh", ["auth", "status"]);
}

function ensureOnDefaultBranch(defaultBranch) {
  const currentBranch = getCurrentBranchName();
  if (currentBranch !== defaultBranch) {
    fail(
      `release push flow must run from ${defaultBranch}; current branch is ${currentBranch}`,
    );
  }
}

function getRepoNameWithOwner() {
  return readStdout("gh", [
    "repo",
    "view",
    "--json",
    "nameWithOwner",
    "-q",
    ".nameWithOwner",
  ]);
}

function readCiRunStatus(commitSha, defaultBranch, repoNameWithOwner) {
  const runsJson = readStdout("gh", [
    "api",
    `repos/${repoNameWithOwner}/actions/workflows/ci.yml/runs`,
    "-f",
    `head_sha=${commitSha}`,
    "-f",
    "event=push",
    "-f",
    `branch=${defaultBranch}`,
    "-f",
    "per_page=1",
  ]);

  const response = JSON.parse(runsJson);
  const run = response.workflow_runs?.[0];

  if (!run) {
    return {
      status: "",
      conclusion: "",
      htmlUrl: "",
    };
  }

  return {
    status: run.status ?? "",
    conclusion: run.conclusion ?? "",
    htmlUrl: run.html_url ?? "",
  };
}

async function waitForSuccessfulCi(commitSha, defaultBranch) {
  const timeoutMs = 30 * 60 * 1000;
  const pollIntervalMs = 15 * 1000;
  const startedAt = Date.now();
  const repoNameWithOwner = getRepoNameWithOwner();

  console.log(
    `› Waiting for CI on ${defaultBranch} to finish for ${commitSha.slice(0, 12)}`,
  );

  while (Date.now() - startedAt < timeoutMs) {
    const run = readCiRunStatus(commitSha, defaultBranch, repoNameWithOwner);

    if (run.status.length === 0) {
      console.log("  No CI run found yet. Retrying in 15s...");
      await sleep(pollIntervalMs);
      continue;
    }

    if (run.status !== "completed") {
      console.log(
        `  CI status: ${run.status}${run.htmlUrl ? ` (${run.htmlUrl})` : ""}`,
      );
      await sleep(pollIntervalMs);
      continue;
    }

    if (run.conclusion !== "success") {
      fail(
        `CI did not succeed for ${commitSha.slice(0, 12)} on ${defaultBranch}: ${run.conclusion || "unknown"}${run.htmlUrl ? ` (${run.htmlUrl})` : ""}`,
      );
    }

    console.log(
      `› CI succeeded for ${commitSha.slice(0, 12)}${run.htmlUrl ? ` (${run.htmlUrl})` : ""}`,
    );
    return;
  }

  fail(
    `timed out waiting for CI on ${defaultBranch} for ${commitSha.slice(0, 12)}`,
  );
}

function smokeTestTarball(version) {
  const tarballName = `electric_coding-wirefmt-${version}.tgz`;
  const script = `
set -euo pipefail
find . -maxdepth 1 -name '*.tgz' -delete
bun pm pack
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"; rm -f "$PWD/${tarballName}"' EXIT
bun add --cwd "$tmp_dir" "$PWD/${tarballName}"
cd "$tmp_dir"

test -x ./node_modules/.bin/wirefmt
test -x ./node_modules/.bin/wirefmt-mcp

actual_version="$(./node_modules/.bin/wirefmt --version)"
if [[ "$actual_version" != "${version}" ]]; then
  echo "unexpected wirefmt version"
  echo "expected: ${version}"
  echo "actual: $actual_version"
  exit 1
fi

help_output="$(./node_modules/.bin/wirefmt --help)"
if [[ "$help_output" != *"wirefmt format"* ]] || [[ "$help_output" != *"wirefmt lint"* ]]; then
  echo "wirefmt help output is missing the expected commands"
  printf '%s\n' "$help_output"
  exit 1
fi

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

node --input-type=module - "${version}" <<'EOF'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const expectedVersion = process.argv[2];
const client = new Client({
  name: "wirefmt-release-smoke",
  version: "0.0.0",
});
const transport = new StdioClientTransport({
  command: "./node_modules/.bin/wirefmt-mcp",
  cwd: process.cwd(),
  stderr: "pipe",
});

function fail(message) {
  throw new Error(message);
}

try {
  await client.connect(transport);

  const serverVersion = client.getServerVersion();
  if (!serverVersion || serverVersion.name !== "wirefmt") {
    fail("MCP server did not identify itself as wirefmt");
  }

  if (serverVersion.version !== expectedVersion) {
    fail(
      \`unexpected MCP server version: expected \${expectedVersion}, received \${serverVersion.version}\`,
    );
  }

  const toolList = await client.listTools();
  const toolNames = toolList.tools.map((tool) => tool.name).sort();
  const expectedToolNames = ["wirefmt.format", "wirefmt.lint"];
  if (toolNames.join(",") !== expectedToolNames.join(",")) {
    fail(
      \`unexpected MCP tool list: expected \${expectedToolNames.join(", ")}, received \${toolNames.join(", ")}\`,
    );
  }

  const formatResult = await client.callTool({
    name: "wirefmt.format",
    arguments: {
      text: "+--+\\n|x|\\n+--+\\n",
    },
  });

  if (
    !formatResult.structuredContent ||
    formatResult.structuredContent.formattedText !== "+---+\\n| x |\\n+---+\\n" ||
    formatResult.structuredContent.changed !== true
  ) {
    fail("unexpected MCP format result");
  }

  const lintResult = await client.callTool({
    name: "wirefmt.lint",
    arguments: {
      text: "+--+\\n|x\\n+--+\\n",
      source: "fixture.txt",
    },
  });

  const issues = lintResult.structuredContent?.issues;
  if (!Array.isArray(issues) || issues.length === 0) {
    fail("unexpected MCP lint result");
  }

  const brokenBorderIssue = issues.find((issue) => issue.code === "broken-border");
  if (
    !brokenBorderIssue ||
    brokenBorderIssue.source !== "fixture.txt" ||
    brokenBorderIssue.lineOrBlock !== "2"
  ) {
    fail("MCP lint result did not preserve the documented broken-border finding");
  }
} finally {
  await client.close();
}
EOF
`;

  run("bash", ["-lc", script], repoRoot);
}

const options = parseArgs(process.argv.slice(2));
const shouldWaitForCi = !options.noPush && !options.pushTag;
ensureCleanGit();

const defaultBranch = getDefaultBranchName();

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
    `  To publish later, run: git push && wait for CI on ${defaultBranch} to succeed, then git push origin ${releaseTag}`,
  );
  process.exit(0);
}

ensureOnDefaultBranch(defaultBranch);

console.log("› git push");
run("git", ["push"]);

const releaseCommitSha = getCurrentCommitSha();

if (shouldWaitForCi) {
  ensureGithubCliReady();
  await waitForSuccessfulCi(releaseCommitSha, defaultBranch);

  console.log(`› git push origin ${releaseTag}`);
  run("git", ["push", "origin", releaseTag]);

  console.log(
    `› Release workflow will publish ${packageJson.name}@${packageJson.version} from ${releaseTag}.`,
  );
  process.exit(0);
}

if (options.pushTag) {
  console.log(`› git push origin ${releaseTag}`);
  run("git", ["push", "origin", releaseTag]);

  console.log(
    `› Release workflow will publish ${packageJson.name}@${packageJson.version} if CI has already succeeded on ${defaultBranch} for ${releaseTag}.`,
  );
  process.exit(0);
}
