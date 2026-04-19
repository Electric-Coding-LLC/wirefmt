# Execution Map

## Goal

Ship `v0-poc` as the first small, usable release of `wirefmt`: a conservative
ASCII box formatter with CLI and MCP support.

## Guardrails

- Keep the product focused on rough ASCII UI wireframes composed of boxes,
  text, and simple layout structure.
- Preserve original order, grouping, and intent rather than redesigning
  layouts.
- Do not broaden the work into general-purpose ASCII art formatting or more
  ambitious layout intelligence.
- Keep CLI and MCP support grounded in the same formatter core.

## Execution Map

- [x] [Define release scope](01-scope/01-define-release-scope.md)
- [x] [Define formatting pipeline](02-architecture/01-define-formatting-pipeline.md)
- [x] [Define box detection and rendering](02-architecture/02-define-box-detection-and-rendering.md)
- [x] [Define tech stack](02-architecture/03-define-tech-stack.md)
- [x] [Define CLI surface](03-cli-and-mcp/01-define-cli-surface.md)
- [x] [Define MCP tool contract](03-cli-and-mcp/02-define-mcp-tool-contract.md)
- [x] [Define error handling and output rules](03-cli-and-mcp/03-define-error-handling-and-output-rules.md)
- [x] [Set up project foundation](04-implementation/01-set-up-project-foundation.md)
- [x] [Build parser and block model](04-implementation/02-build-parser-and-block-model.md)
- [x] [Build box detection](04-implementation/03-build-box-detection.md)
- [x] [Build normalization and rendering](04-implementation/04-build-normalization-and-rendering.md)
- [x] [Add CLI entrypoints](04-implementation/05-add-cli-entrypoints.md)
- [x] [Add MCP wrapper](04-implementation/06-add-mcp-wrapper.md)
- [x] [Add lint mode](04-implementation/07-add-lint-mode.md)
- [x] [Test formatting behavior](05-testing/01-test-formatting-behavior.md)
- [x] [Fix edge cases and polish](05-testing/02-fix-edge-cases-and-polish.md)
- [x] [Create support documentation](06-release/01-create-support-documentation.md)
- [x] [Prepare release build](06-release/02-prepare-release-build.md)
- [x] [Ship CLI and MCP tool](06-release/03-ship-cli-and-mcp-tool.md)
- [x] [Verify release](06-release/04-verify-release.md)

## Done When

- `wirefmt` can format rough ASCII UI wireframes through the CLI.
- The same formatter core is available through the shipped MCP server.
- The release is documented, packaged, and verified as one small product.
