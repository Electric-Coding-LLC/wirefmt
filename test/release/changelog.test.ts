import { describe, expect, test } from "bun:test";
import {
  createChangelogEntry,
  formatChangelogDate,
} from "../../src/release/changelog";

describe("release changelog helpers", () => {
  test("formats changelog dates in the requested local timezone", () => {
    const instant = new Date("2026-04-20T00:19:31.000Z");

    expect(formatChangelogDate(instant, "America/Los_Angeles")).toBe(
      "2026-04-19",
    );
    expect(formatChangelogDate(instant, "UTC")).toBe("2026-04-20");
  });

  test("creates a fallback maintenance entry when no shipped subjects exist", () => {
    expect(createChangelogEntry("0.5.1", "2026-04-19", [])).toBe(
      [
        "## 0.5.1 - 2026-04-19",
        "",
        "### Changed",
        "",
        "- Maintenance release without additional user-facing notes.",
      ].join("\n"),
    );
  });
});
