# Release Runbook

This guide covers how `wirefmt` releases are prepared and published.

It is not the source of truth for roadmap version scope. Use the docs this way:

- `ROADMAP.md`: version order, version scope, and internal version lifecycle
- `PLAN.md`: one active promoted version
- `plans/*/EXECMAP.md`: active execution and completion state
- `CHANGELOG.md`: shipped package history
- `docs/release.md`: publication runbook

Keep those responsibilities separate so the plan does not become a publication
manual, and the changelog does not become a step tracker.

## Normal PRs

Normal PRs do not need release metadata files.

## Release Flow

When you want to cut a release, run:

```sh
bun run release -- <patch|minor|major|x.y.z>
```

That command:

- bumps `package.json`
- updates `CHANGELOG.md` from shipped commits since the last published version
- runs `bun run check`
- runs `bun run build`
- runs `bun run pack:dry-run`
- runs the packed-install smoke test
- creates the release commit
- creates the matching tag
- pushes the release commit
- waits for CI on `main`
- pushes the tag so the publish workflow can run

Use `--no-push` to prepare the release commit and tag locally only. Use
`--push-tag` to skip waiting for CI locally and push the tag immediately.

## Publish Workflow

The publish workflow lives at `.github/workflows/release.yml` and runs when a
tag like `v0.5.0` is pushed.

It:

- validates that the tag matches `package.json`
- verifies successful CI for the tagged commit on `main`
- reruns `bun run check`
- rebuilds the packaged entrypoints
- reruns `bun run pack:dry-run`
- reruns the packed-install smoke test
- publishes to npm if the version is not already published
- creates a GitHub release using the matching `CHANGELOG.md` entry

## Local Checks

Before cutting a release, run the normal local gate if you have not just run
the release helper:

```sh
bun install
bun run check
bun run build
bun run pack:dry-run
```

For a direct tarball smoke test:

```sh
tarball="$(npm pack --json --ignore-scripts | node -e 'const fs = require("fs"); const input = fs.readFileSync(0, "utf8"); const match = input.match(/"filename"\\s*:\\s*"([^"]+\\.tgz)"/); if (!match) process.exit(1); console.log(match[1]);')"
node tools/smoke-packed-install.js "$tarball"
```

## Verify Publication

After the release workflow runs, confirm the published version:

```sh
npm view @electric_coding/wirefmt version
```

Confirm the GitHub release exists:

```sh
gh release view v<version>
```

## If Publish Fails

The most likely remaining blockers are workflow configuration, npm trusted
publishing, or a stale changelog base tag.

If the workflow fails during publish:

- confirm trusted publishing is configured for this repository on npm
- confirm the package name is still intended to be `@electric_coding/wirefmt`
- confirm the pushed tag matches `package.json`
- confirm the tagged commit succeeded in `CI / verify` on `main`
- confirm `CHANGELOG.md` contains the matching version entry
- rerun the workflow after the underlying fix
