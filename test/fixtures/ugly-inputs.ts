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
  unsupportedMultiBoxLayout: ["+--+ +--+", "|a|   |b|", "+--+ +--+", ""].join(
    "\n",
  ),
} as const;
