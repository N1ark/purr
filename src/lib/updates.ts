/** The pure half of self-updating: when to check, and what the release notes say in a few lines. */

/** Long enough not to be a request an hour, short enough not to be a fortnight behind. */
export const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

/** Whether enough time has passed since the last check to make another. */
export function dueForCheck(last: number, now: number, interval: number = CHECK_INTERVAL): boolean {
  // A clock that went backwards should mean "check now", not "never check again".
  return last <= 0 || now < last || now - last >= interval;
}

/** One line of the notes: a bullet or a paragraph, or the heading over them. */
export interface NoteLine {
  text: string;
  heading: boolean;
}

/** A changelog section flattened to lines, not rendered: a banner has no room for markdown. */
export function noteLines(notes: string, limit = 12): NoteLine[] {
  const lines: NoteLine[] = [];
  for (const raw of notes.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      // A blank line ends whatever was being continued.
      lines.push({ text: "", heading: false });
      continue;
    }
    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const last = lines.at(-1);
    if (bullet) lines.push({ text: bullet[1], heading: false });
    else if (heading) lines.push({ text: heading[1], heading: true });
    else if (last?.text) last.text = `${last.text} ${line}`;
    else lines.push({ text: line, heading: false });
  }
  return lines.filter((line) => line.text !== "").slice(0, limit);
}

/** Without the headings: "Added" over one line of prose costs a third of the room. */
export function noteSummary(notes: string, limit = 3): string[] {
  return noteLines(notes, Number.MAX_SAFE_INTEGER)
    .filter((line) => !line.heading)
    .slice(0, limit)
    .map((line) => line.text);
}
