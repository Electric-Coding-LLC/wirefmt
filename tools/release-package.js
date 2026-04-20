#!/usr/bin/env bun

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  createChangelogEntry,
  formatChangelogDate,
} from "../src/release/changelog";

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, "package.json");
const changelogPath = path.join(repoRoot, "CHANGELOG.md");
const registryUrl = "https://registry.npmjs.org";

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function usage(exitCode = 1) {
  console.error(`Usage: bun run release -- <patch|minor|major|x.y.z> [--no-push] [--push-tag]

Bumps the package version, updates CHANGELOG.md from shipped commits, runs the
local release gate, creates a release commit and tag, pushes the release commit
by default, waits for CI on the default branch to succeed, and then pushes the
release tag unless --no-push or --push-tag is provided.`);
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

function tryReadStdout(command, args, cwd = repoRoot) {
  const result = Bun.spawnSync({
    cmd: [command, ...args],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
    env: process.env,
  });

  if (result.exitCode !== 0) {
    return null;
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
    "-X",
    "GET",
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

function readPublishedVersion(packageName) {
  const version = tryReadStdout("npm", [
    "view",
    packageName,
    "version",
    `--registry=${registryUrl}`,
  ]);
  return version && version.length > 0 ? version : null;
}

function ensureTagExists(tagName) {
  if (runQuiet("git", ["rev-parse", "--verify", tagName]).exitCode !== 0) {
    fail(`expected local tag ${tagName} to exist for changelog generation`);
  }
}

function readReleaseSubjects(sinceTag, packageName) {
  const rangeArgs = sinceTag ? [`${sinceTag}..HEAD`] : [];
  const output = readStdout("git", [
    "log",
    "--reverse",
    "--format=%s",
    ...rangeArgs,
  ]);

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith(`${packageName}@`))
    .filter((line) => !line.startsWith("Version Packages"));
}

function ensureChangelogExists() {
  if (!existsSync(changelogPath)) {
    return [
      "# Changelog",
      "",
      "All notable shipped changes to `@electric_coding/wirefmt` are recorded here.",
      "",
      "This file tracks published package history. Plans under `plans/*` track",
      "execution, not shipped versions.",
      "",
    ].join("\n");
  }

  return readFileSync(changelogPath, "utf8");
}

function insertChangelogEntry(existing, entry) {
  const lines = existing.split(/\r?\n/);
  const firstVersionIndex = lines.findIndex((line) => line.startsWith("## "));

  if (firstVersionIndex === -1) {
    const normalized = existing.endsWith("\n") ? existing : `${existing}\n`;
    return `${normalized}\n${entry}`;
  }

  const before = lines
    .slice(0, firstVersionIndex)
    .join("\n")
    .replace(/\s*$/, "");
  const after = lines.slice(firstVersionIndex).join("\n").replace(/^\s*/, "");
  return `${before}\n\n${entry}\n\n${after}\n`;
}

function updateChangelog(version, packageName) {
  const publishedVersion = readPublishedVersion(packageName);
  const sinceTag = publishedVersion ? `v${publishedVersion}` : null;
  if (sinceTag) {
    ensureTagExists(sinceTag);
  }

  const subjects = readReleaseSubjects(sinceTag, packageName);
  const date = formatChangelogDate();
  const entry = createChangelogEntry(version, date, subjects);
  const existing = ensureChangelogExists();

  if (existing.includes(`## ${version} - `)) {
    fail(`CHANGELOG.md already contains an entry for ${version}`);
  }

  writeFileSync(changelogPath, insertChangelogEntry(existing, entry), "utf8");
}

function smokeTestTarball(version) {
  const packDir = path.join(repoRoot, ".tmp-release-pack");

  rmSync(packDir, { recursive: true, force: true });
  mkdirSync(packDir, { recursive: true });

  try {
    const packOutput = readStdout("npm", [
      "pack",
      "--json",
      "--pack-destination",
      packDir,
      "--ignore-scripts",
    ]);
    const tarballName = packOutput.match(
      /"filename"\s*:\s*"([^"]+\.tgz)"/,
    )?.[1];
    if (tarballName === undefined) {
      fail("npm pack did not return a tarball filename");
    }
    const tarballPath = path.join(packDir, tarballName);
    run(
      "node",
      ["tools/smoke-packed-install.js", tarballPath, version],
      repoRoot,
    );
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
}

const options = parseArgs(process.argv.slice(2));
const shouldWaitForCi = !options.noPush && !options.pushTag;
ensureCleanGit();

const defaultBranch = getDefaultBranchName();
const packageBefore = readPackageJson();

console.log(`› npm version ${options.bump} --no-git-tag-version`);
run("npm", ["version", options.bump, "--no-git-tag-version"]);

const packageJson = readPackageJson();
const releaseTag = `v${packageJson.version}`;

console.log("› update CHANGELOG.md");
updateChangelog(packageJson.version, packageBefore.name);

console.log("› bun run check");
run("bun", ["run", "check"]);

console.log("› bun run build");
run("bun", ["run", "build"]);

console.log("› npm pack --dry-run");
run("npm", ["pack", "--dry-run", "--ignore-scripts"]);

console.log("› smoke-test packed install");
smokeTestTarball(packageJson.version);

console.log("› git add package.json CHANGELOG.md");
run("git", ["add", "package.json", "CHANGELOG.md"]);

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
