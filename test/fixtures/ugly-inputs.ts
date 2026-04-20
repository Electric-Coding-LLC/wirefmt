export const uglyInputFixtures = {
  messySpacing: [
    "Draft note",
    "",
    "  +----+",
    "  |  hi|",
    "  +----+",
    "",
    "Needs cleanup",
    "",
  ].join("\n"),
  partialStructure: ["+----+", "|  x", "+--+", ""].join("\n"),
  supportedAdjacentBoxes: [
    "+---+ +----+",
    "| a | | bb |",
    "+---+ +----+",
    "",
  ].join("\n"),
  supportedAdjacentBoxesBrokenRight: [
    "+---+ +----+",
    "| a | | bb",
    "+---+ +----+",
    "",
  ].join("\n"),
  supportedAdjacentBoxesThreeSpaces: [
    "+---+   +----+",
    "| a |   | bb |",
    "+---+   +----+",
    "",
  ].join("\n"),
  supportedAdjacentBoxesThreeSpacesBrokenRight: [
    "+---+   +----+",
    "| a |   | bb",
    "+---+   +----+",
    "",
  ].join("\n"),
  unsupportedMultiBoxLayout: [
    "+--+    +--+",
    "|a|    |b|",
    "+--+    +--+",
    "",
  ].join("\n"),
} as const;
