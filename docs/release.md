# Release Guide

This guide covers the `v0.2` release flow for `wirefmt`.

## Release Message

`wirefmt v0.2 makes formatting and linting available through matching CLI and MCP surfaces backed by one conservative box engine.`

## Scope Guardrails

- Ship one small product surface.
- CLI: `wirefmt format`, `wirefmt lint`
- MCP: `wirefmt.format`, `wirefmt.lint`
- Keep the release centered on conservative single-box behavior.
- Do not expand the release story into broader ASCII art or multi-box support.

## Prerequisites

- Bun `>=1.3.11`
- npm publish access for `@electric_coding/wirefmt`
- Push access to `origin`

## Preflight

Run the full local check before creating release artifacts:

```sh
bun install
bun run check
bun run pack:dry-run
```

## Local Release Helper

Use the bundled helper to bump the version, run the release gate, create the
release commit, and create the matching local `v<version>` tag:

```sh
bun run release -- patch
```

From the current `0.1.x` line, use `minor` for the first `v0.2` release:

```sh
bun run release -- minor
```

Supported arguments:

- `patch`
- `minor`
- `major`
- an explicit version like `0.2.0`

By default, the helper pushes the release commit, waits for GitHub `CI` on the
default branch to succeed for that exact SHA, and then pushes the matching
release tag automatically.

Add `--no-push` to stop after the local commit and tag.
Add `--push-tag` to push the tag immediately after the release commit instead of
waiting for `CI`.

The helper now checks all of these before it creates the release commit:

- full local test and lint gate
- packed install from a clean temp directory
- packaged `wirefmt` version, help output, and canonical format example
- packaged `wirefmt-mcp` registration of `wirefmt.format` and `wirefmt.lint`
- documented MCP format and lint calls through the installed server

## Build And Smoke-Test The Tarball

Create the tarball:

```sh
bun pm pack
```

Install it into a clean temp directory and verify the shipped executables:

```sh
tmp_dir="$(mktemp -d)"
cd "$tmp_dir"
bun add /path/to/electric_coding-wirefmt-<version>.tgz
./node_modules/.bin/wirefmt --version
./node_modules/.bin/wirefmt --help
printf '+--+\n|x|\n+--+\n' | ./node_modules/.bin/wirefmt format
```

Expected CLI output:

```text
<version>
+---+
| x |
+---+
```

Then confirm the MCP server exposes the intended `v0.2` tool surface. The
release helper already automates this against the packed tarball, but the
manual check is still:

- `wirefmt.format`
- `wirefmt.lint`

## Publish The Package

Publish from the repo root after the tarball smoke test passes:

```sh
npm publish
```

Confirm the published version:

```sh
npm view @electric_coding/wirefmt version
```

## Manual GitHub Release Workflow

This repo also supports a GitHub Actions release flow through
`.github/workflows/release.yml`.

Before using it:

- Configure npm trusted publishing for this repository if the workflow should
  publish to npm.
- Bump `package.json` to the release version and push that commit to `main`.
- Push the matching release tag for the same commit.

The release workflow runs on a matching tag push such as `v0.2.0`, then checks
that the tagged commit has already passed the `CI` workflow for a push to the
default branch.

In practice, the release signal is:

- a successful `CI` run for the target commit on the default branch
- a matching release tag such as `v0.2.0` pushed after that

Recommended sequence:

```sh
bun run release -- minor
```

That pushes the release commit, polls GitHub for the matching `CI` run on the
default branch, and only pushes `v<version>` after `CI` concludes with success.

Manual alternative:

1. `bun run release -- minor --no-push`
2. `git push`
3. Wait for `CI` on the pushed default-branch commit to succeed.
4. `git push origin v<version>`

The workflow reads the package name and version from `package.json`, confirms
that the pushed tag matches that version, verifies successful `CI` for the
tagged commit, runs `bun run check`, runs package smoke tests, publishes to npm
when that version is not already in the registry, then creates the GitHub
release notes.

## Tag The Release

Create and push the version tag if the repo is using Git tags for released
versions:

```sh
git tag v<version>
git push origin v<version>
```

## Immediate Distribution Paths

Until consumers switch to the registry release, `wirefmt` can also be shared as:

- A global package install: `bun install -g @electric_coding/wirefmt`
- A local tarball install produced by `bun pm pack`
- A direct MCP server command from a local checkout

See [MCP Integration](./mcp.md) for MCP client wiring examples.
