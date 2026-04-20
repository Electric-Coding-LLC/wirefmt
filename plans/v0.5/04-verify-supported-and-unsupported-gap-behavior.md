# Verify supported and unsupported gap behavior

[Back to Execution Map](./EXECMAP.md)

## Goal

Prove that the `v0.5` small-gap support works for the intended two-box shapes
and stays conservative for nearby layouts that remain unsupported.

## Tasks

- Add fixture and regression coverage for supported one-, two-, and
  three-space gap examples.
- Add or update coverage showing that four-plus-space layouts and other nearby
  multi-box shapes still pass through unchanged and lint predictably.
- Verify CLI and MCP parity for the new supported gap range and the unchanged
  unsupported cases.

## Constraints

- Keep tests focused on the shipped `v0.5` contract rather than speculative
  future layouts.
- Reuse existing fixture/test structure where practical instead of creating a
  parallel test harness.

## Exit Criteria

- Tests clearly separate supported small-gap inputs from unchanged unsupported
  layouts.
- Repo-native verification for the changed scope passes.

<!-- Track completion in EXECMAP.md, not in this file. -->
