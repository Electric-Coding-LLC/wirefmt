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
  supportedThreeSiblingBoxes: [
    "+---+ +----+   +---+",
    "| a | | bb |   | c |",
    "+---+ +----+   +---+",
    "",
  ].join("\n"),
  supportedThreeSiblingBoxesBrokenRight: [
    "+---+ +----+   +---+",
    "| a | | bb |   | c ",
    "+---+ +----+   +---+",
    "",
  ].join("\n"),
  supportedAdjacentBoxesThreeSpacesBrokenRight: [
    "+---+   +----+",
    "| a |   | bb",
    "+---+   +----+",
    "",
  ].join("\n"),
  unsupportedMultiBoxLayout: [
    "+--+ +--+ +--+ +--+",
    "|a| |b| |c| |d|",
    "+--+ +--+ +--+ +--+",
    "",
  ].join("\n"),
  unsupportedAdjacentGap: [
    "+--+    +--+",
    "|a|    |b|",
    "+--+    +--+",
    "",
  ].join("\n"),
  unsupportedThreeSiblingGap: [
    "+---+    +----+ +---+",
    "| a |    | bb | | c |",
    "+---+    +----+ +---+",
    "",
  ].join("\n"),
  unsupportedAdjacentStagger: ["+--+ +--+", "|a| |b|", " +--+ +--+", ""].join(
    "\n",
  ),
  unsupportedInteriorBorder: ["+--+", "|a|", "+--+", "|b|", "+--+", ""].join(
    "\n",
  ),
  textOutsideBox: ["+--+", "|a| note", "+--+", ""].join("\n"),
} as const;
