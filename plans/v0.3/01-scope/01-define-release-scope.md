# Define Release Scope

[Back to Execution Map](../EXECMAP.md)

## Goal

Define a focused `v0.3` release that chooses the next product step after the
completed `v0.2` parity work.

## Candidate Release Themes

### Option A

Runtime portability.

- Make the published package easier to install and run without requiring Bun as
  the user-facing runtime.
- Focus on the shipped executables, installed-package behavior, and MCP launch
  reliability.
- Improves adoption without changing the conservative layout contract.

### Option B

Workflow polish.

- Add more machine-friendly CLI output, quality-of-life flags, or editor/task
  runner integration.
- Could improve repeat use for existing adopters.
- Does not remove the biggest current install and runtime constraint.

### Option C

Broader layout intelligence.

- Start supporting adjacent boxes, nested boxes, or more ambitious repair
  behavior.
- Creates the largest feature headline.
- Carries the highest product and implementation risk because it pushes against
  the current conservative single-box promise.

## Recommended Theme

Runtime portability.

## Release Goal

Ship `wirefmt` as a small, reliable ASCII box tool that users and MCP clients
can install and launch cleanly without Bun-specific setup as the default path.

## Starting Point

- `v0.2` is shipped through `v0.2.4` and already covers the intended CLI and
  MCP parity line.
- The current docs and package surface still describe Bun as the prerequisite
  runtime.
- The main remaining product friction is adoption and distribution, not missing
  agent-facing commands.
- Broader layout support should remain a separate later decision until the
  distribution story is simpler.

## Why This Theme Wins

- It solves the clearest practical gap in the current release line.
- It improves first-run success for both CLI users and MCP-client setup.
- It preserves the repo's conservative product boundary instead of reopening
  layout semantics immediately.
- It creates a better base for future workflow polish or richer layout support.

## In Scope

- Define the intended runtime and packaging story for published installs.
- Ship portable `wirefmt` and `wirefmt-mcp` entrypoints or bundled artifacts.
- Verify global-install, local-package, and MCP-launch flows against the
  published package shape.
- Update docs and release tooling to reflect the portable install path.
- Keep the CLI and MCP behavior aligned with the existing shared core engine.

## Optional

- Small release-tooling cleanup needed to support portable packaging.
- Narrow docs polish for Node and Bun development workflows in the repo.
- Minor install-time UX cleanup that does not expand the core feature set.

## Out Of Scope

- Smarter layout interpretation for adjacent, nested, or multi-column boxes.
- Guessing intended repairs for ambiguous diagrams.
- Expanding `wirefmt` into general-purpose ASCII art formatting.
- Large new command surface area unrelated to install or launch friction.
- Hosted service, GUI, or editor-extension ambitions.

## Exit Criteria

- A user can install the published package and run `wirefmt --version` without
  Bun as a required end-user runtime.
- An MCP client can launch the shipped `wirefmt-mcp` entrypoint from the
  published package with a documented setup flow.
- Repo docs clearly distinguish contributor tooling from end-user install
  requirements.
- The release remains narrow: adoption first, broader layout ambition later.
