# Verify supported and unsupported layout behavior

[Back to Execution Map](./EXECMAP.md)

## Goal

Verify that `v0.4` expands support only where intended and preserves the
conservative fallback behavior everywhere else.

## Tasks

- Add fixture and regression coverage for the supported adjacent-box shape.
- Add or update coverage showing that nearby unsupported multi-box shapes still
  pass through unchanged and lint predictably.
- Run the repo verification gates needed to prove shared-core, CLI, and MCP
  parity for the new boundary.

## Constraints

- Prefer explicit fixtures that document the product boundary over ad hoc unit
  cases with unclear intent.
- Verify parity through the real shipped surfaces, not just core-only tests.

## Exit Criteria

- Tests clearly separate supported adjacent-box inputs from unchanged
  unsupported layouts.
- The relevant repo verification commands pass for the `v0.4` change set.

<!-- Track completion in EXECMAP.md, not in this file. -->
