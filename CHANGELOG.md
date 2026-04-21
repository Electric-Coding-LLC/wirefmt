# Changelog

All notable shipped changes to `@electric_coding/wirefmt` are recorded here.

This file tracks published package history. Plans under `plans/*` track
execution, not shipped versions.

## 0.8.0 - 2026-04-21

### Changed

- v0.6 conservative diagnostics (#22)
- v0.7 three sibling boxes (#23)
- [codex] v0.8 compound panels (#24)

## 0.5.1 - 2026-04-19

### Changed

- surface cli format warnings (#21)

## 0.5.0 - 2026-04-19

### Changed

- add v0.5 small-gap adjacent box support (#19)
- Fix release docs
- fix release changelog dates (#20)

## 0.4.0 - 2026-04-19

### Changed

- Add bounded adjacent sibling box support while keeping the conservative box
  formatting boundary.

## 0.3.0 - 2026-04-19

### Changed

- Ship portable Node-launched `wirefmt` and `wirefmt-mcp` entrypoints so
  installed users no longer need Bun on their default path.
- Harden the packaged-install contract and install/update guidance for published
  users.

## 0.2.4 - 2026-04-18

### Fixed

- Polish the MCP entrypoint UX and repair remaining release-file issues from
  the `0.2.x` line.

## 0.2.1 - 2026-04-17

### Changed

- Add MCP `wirefmt.lint` parity and complete the initial testing and release
  hardening pass.

## 0.1.2 - 2026-04-17

### Fixed

- Repair npm trusted publishing for the first public package line.

## 0.1.0 - 2026-04-17

### Added

- Initial public release of the conservative `wirefmt` formatter and linter.
- Ship matching CLI and MCP surfaces for small ASCII box workflows.



