---
name: wirefmt
description: Format or validate simple ASCII wireframe boxes that use `+`, `-`, and `|`. Use when the user wants box-shaped text cleaned up, normalized, or checked for malformed borders. Prefer the `wirefmt.format` MCP tool for formatting and the `wirefmt` CLI for linting.
---

# Wirefmt

## Goal

Use `wirefmt` instead of hand-editing simple ASCII boxes.

## Scope

- In scope:
  - Single-box ASCII wireframes made from `+`, `-`, and `|`
  - Formatting box-shaped text
  - Linting likely border and alignment problems
- Out of scope:
  - Multi-column ASCII art repair
  - Reinterpreting ambiguous layouts
  - General-purpose text formatting

## Workflow

1. Choose the interface.
- For formatting, use the `wirefmt.format` MCP tool.
- For lint findings, use the CLI:
  - `bun run /Users/iamce/dev/electric/wirefmt/src/cli/bin.ts lint`

2. Prefer the formatter over manual edits.
- Pass the user text directly to `wirefmt.format`.
- Include `width` and `pad` only when the user asked for them or they are already specified.

3. Handle conservative behavior correctly.
- If formatting returns `warnings`, surface them briefly.
- If the layout is unsupported or ambiguous, do not guess at repairs.
- Leave non-box text unchanged unless the user asked for a broader rewrite.

4. Verify when editing files.
- If `wirefmt` changed a checked-in file, review the rendered box in context.
- For repo work in `/Users/iamce/dev/electric/wirefmt`, run `bun run check` when the change is substantive.

## Example Triggers

- "Clean up this ASCII box."
- "Normalize these wireframes."
- "Lint this malformed box diagram."
- "Use wirefmt on this README snippet."

## Guardrails

- Do not hand-tune spacing first and call `wirefmt` second.
- Do not widen or pad boxes unless the user requested it or the existing command/input specifies it.
- Do not claim lint support through MCP unless the server surface explicitly supports it.
