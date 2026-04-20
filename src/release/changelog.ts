function readDatePart(
  parts: readonly Intl.DateTimeFormatPart[],
  type: "year" | "month" | "day",
): string {
  const value = parts.find((part) => part.type === type)?.value;
  if (value === undefined) {
    throw new Error(`missing ${type} from changelog date formatter`);
  }

  return value;
}

export function formatChangelogDate(
  date = new Date(),
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = readDatePart(parts, "year");
  const month = readDatePart(parts, "month");
  const day = readDatePart(parts, "day");
  return `${year}-${month}-${day}`;
}

export function createChangelogEntry(
  version: string,
  date: string,
  subjects: readonly string[],
): string {
  const bullets =
    subjects.length > 0
      ? subjects.map((subject) => `- ${subject}`)
      : ["- Maintenance release without additional user-facing notes."];

  return [`## ${version} - ${date}`, "", "### Changed", "", ...bullets].join(
    "\n",
  );
}
