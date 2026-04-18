# Add Installed Package Smoke Tests

[Back to Plan](../PLAN.md)

## Goal

Add verification that exercises `wirefmt` from the packaged install shape, not
only from the source checkout, with the `v0.3` default path treated as a
Node-launched installed package.

## Tasks

- Add or extend smoke tests around the packed tarball or equivalent install
  artifact.
- Install the packed artifact through a normal Node package flow so the smoke
  test matches the documented default user path.
- Verify `wirefmt --version` from an installed package context.
- Verify `wirefmt-mcp --version` from an installed package context.
- Verify the installed binaries are the packaged Node-launched entrypoints for
  the published artifact, not Bun-backed source entrypoints.

## Coverage Priorities

- Installed CLI launch.
- Installed MCP entrypoint launch.
- Installed package layout and runtime assumptions for the `v0.3` distribution
  story:
  - Node-launched wrappers in `bin/`
  - packaged runtime artifacts in `dist/`
- Minimal functional checks that confirm the packaged commands reach the real
  formatter and server.

## Exit Criteria

- Release verification fails if the packaged entrypoints are not runnable.
- Release verification fails if the packed install still depends on Bun-specific
  manual wiring in the default user path.
- The installed package shape is exercised directly in automated checks or the
  release helper path.
