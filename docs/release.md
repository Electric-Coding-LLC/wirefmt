# Release Guide

This guide covers the `v0.4` release flow for `wirefmt`.

## Release Message

`wirefmt v0.4 adds bounded adjacent sibling box support while keeping the install/runtime story and conservative product boundary from v0.3.`

## Scope Guardrails

- Ship one small product surface.
- CLI: `wirefmt format`, `wirefmt lint`
- MCP: `wirefmt.format`, `wirefmt.lint`
- Keep the release centered on exactly two sibling boxes with one separating
  space column.
- Keep wider-gap layouts, three-plus columns, nested boxes, and other broader
  layout ambitions out of scope.
- Preserve Bun as the maintainer runtime and Node as the installed-user
  runtime.

## Prerequisites

- Bun `>=1.3.11`
- Node.js `>=18.17.0`
- npm publish access for `@electric_coding/wirefmt`
- Push access to `origin`
- A clean git worktree

## Preflight

Run the full local gate before creating release artifacts:

```sh
bun install
bun run check
bun run build
bun run pack:dry-run
```

## Local Release Helper

Use the bundled helper to bump the version, run the release gate, create the
release commit, and create the matching local `v<version>` tag:

```sh
bun run release -- patch
```

For the first `v0.4` release from the current `0.3.x` line, use `minor`:

```sh
bun run release -- minor
```

Supported arguments:

- `patch`
- `minor`
- `major`
- an explicit version like `0.4.0`

By default, the helper pushes the release commit, waits for GitHub `CI` on the
default branch to succeed for that exact SHA, and then pushes the matching
release tag automatically.

Add `--no-push` to stop after the local commit and tag.
Add `--push-tag` to push the tag immediately after the release commit instead of
waiting for `CI`.

The helper checks all of these before it creates the release commit:

- full local typecheck, lint, and test gate
- bundled `dist/` build for the published Node runtime
- npm package contents via `npm pack --dry-run`
- clean temp install through `npm install`
- installed `wirefmt` version, help, format, and lint behavior
- installed `wirefmt-mcp` version, tool registration, and MCP format/lint calls
- shipped package layout:
  - Node wrappers in `bin/`
  - bundled runtime in `dist/`
  - no installed `src/` runtime dependency
- a clean git worktree with no staged or unstaged changes

## Build And Smoke-Test The Tarball

Create the tarball:

```sh
tarball="$(npm pack --json --ignore-scripts | node -e 'const fs = require("fs"); const input = fs.readFileSync(0, "utf8"); const match = input.match(/"filename"\\s*:\\s*"([^"]+\\.tgz)"/); if (!match) process.exit(1); console.log(match[1]);')"
```

Run the same packed-install smoke test that CI and the release helper use:

```sh
node tools/smoke-packed-install.js "$tarball"
```

That script installs the tarball into a clean temp directory with npm and
verifies both shipped entrypoints from the installed package shape.

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

The release workflow runs on a matching tag push such as `v0.4.0`, then checks
that the tagged commit has already passed the `CI` workflow for a push to the
default branch.

Recommended sequence:

```sh
bun run release -- minor
```

Manual alternative:

1. `bun run release -- minor --no-push`
2. `git push`
3. Wait for `CI` on the pushed default-branch commit to succeed.
4. `git push origin v<version>`

The workflow reads the package name and version from `package.json`, confirms
that the pushed tag matches that version, verifies successful `CI` for the
tagged commit, runs `bun run check`, runs the packaged-install smoke test,
publishes to npm when that version is not already in the registry, then creates
the GitHub release notes.

## Immediate Distribution Paths

Until consumers switch to the registry release, `wirefmt` can also be shared as:

- A global package install: `npm install -g @electric_coding/wirefmt`
- A local tarball install produced by `npm pack`
- A direct MCP server command from a local checkout with Bun

See [MCP Integration](./mcp.md) for MCP client wiring examples.
