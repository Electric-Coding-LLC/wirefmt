# Package CLI And MCP Binaries For Portable Install

[Back to Execution Map](../EXECMAP.md)

## Goal

Produce a published package shape that carries the intended portable install
story for both shipped executables by packaging Node-targeted runtime bundles.

## Tasks

- Add a build step that emits bundled runtime entrypoints for:
  - `src/cli/bin.ts`
  - `src/mcp/bin.ts`
- Use Bun as the maintainer build tool, but target Node for the shipped
  runtime bundles.
- Write the build output to a dedicated published runtime directory such as
  `dist/`.
- Ensure the published package includes everything needed for:
  - `wirefmt`
  - `wirefmt-mcp`
- Update `package.json` package contents and `bin` mapping so installed binaries
  resolve through `bin/` into the packaged `dist/` artifacts.
- Stop relying on raw `src/` files as the installed runtime surface.
- Keep the package small and understandable.

## Packaging Guardrails

- Prefer one clear artifact strategy:
  - Bun builds Node-targeted bundles
  - Node launches the installed binaries
- Keep binary names stable.
- Keep the package contents easy to inspect and smoke-test.
- Keep the published layout explicit enough that `npm pack --dry-run` can show
  the real installed runtime files.

## Exit Criteria

- The packed tarball contains the files required by the `v0.3` install
  contract.
- The tarball includes the packaged runtime artifacts in `dist/`.
- Both shipped executables are runnable from the installed package shape.
- Packaging changes remain compatible with npm publication.
