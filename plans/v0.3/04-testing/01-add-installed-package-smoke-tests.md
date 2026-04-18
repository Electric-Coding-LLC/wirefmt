# Add Installed Package Smoke Tests

[Back to Plan](../PLAN.md)

## Goal

Add verification that exercises `wirefmt` from the packaged install shape, not
only from the source checkout.

## Tasks

- Add or extend smoke tests around the packed tarball or equivalent install
  artifact.
- Verify `wirefmt --version` from an installed package context.
- Verify `wirefmt-mcp --version` from an installed package context.

## Coverage Priorities

- Installed CLI launch.
- Installed MCP entrypoint launch.
- Minimal functional checks that confirm the packaged commands reach the real
  formatter and server.

## Exit Criteria

- Release verification fails if the packaged entrypoints are not runnable.
- The installed package shape is exercised directly in automated checks or the
  release helper path.
