# Release Guide

This guide covers the shipping steps for the `v0-poc` release of `wirefmt`.

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
release commit, and create the matching `v<version>` tag:

```sh
bun run release -- patch
```

Supported arguments:

- `patch`
- `minor`
- `major`
- an explicit version like `0.1.1`

Add `--no-push` to stop after the local commit and tag.

## Build And Smoke-Test The Tarball

Create the tarball:

```sh
bun pm pack
```

Install it into a clean temp directory and verify the shipped executables:

```sh
tmp_dir="$(mktemp -d)"
cd "$tmp_dir"
bun add /path/to/electric_coding-wirefmt-0.1.0.tgz
./node_modules/.bin/wirefmt --version
printf '+--+\n|x|\n+--+\n' | ./node_modules/.bin/wirefmt format
```

Expected CLI output:

```text
0.1.0
+---+
| x |
+---+
```

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
- Bump `package.json` to the release version and merge that change to `main`.

You can trigger it in either of these ways:

- Run it manually from GitHub Actions with `workflow_dispatch`.
- Push a matching release tag such as `v0.1.1`.

The workflow reads the package name and version from `package.json`, validates
that a pushed tag matches that version, runs `bun run check`, runs package
smoke tests, publishes to npm when that version is not already in the registry,
then creates the GitHub release notes.

## Tag The Release

Create and push the version tag if the repo is using Git tags for released
versions:

```sh
git tag v0.1.0
git push origin v0.1.0
```

## Immediate Distribution Paths

Until consumers switch to the registry release, `wirefmt` can also be shared as:

- A global package install: `bun install -g @electric_coding/wirefmt`
- A local tarball install produced by `bun pm pack`
- A direct MCP server command from a local checkout

See [MCP Integration](./mcp.md) for MCP client wiring examples.
