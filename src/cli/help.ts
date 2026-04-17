export const CLI_USAGE = `wirefmt

Usage:
  wirefmt format [file] [--width <number>] [--pad <number>]
  wirefmt lint [file] [--width <number>] [--pad <number>]
  wirefmt --help
  wirefmt --version

Commands:
  format  Format a wireframe from a file or stdin.
  lint    Report lint findings for a file or stdin.

Flags:
  --width  Target outer width, including borders.
  --pad    Inner spaces on both left and right sides of content. Default: 1
  --help   Show usage information.
  --version  Show the current version.
`;
