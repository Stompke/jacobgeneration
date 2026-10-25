export const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export type HourState = "open" | "pending" | "filled";

export type PublicSlot = {
  hour: number;
  label: string;
  state: HourState;
  names: string[];
};

type Clock = {
  hour12: number;
  suffix: "AM" | "PM";
  text: string;
};

function clock(hour: number): Clock {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized < 12 ? "AM" : "PM";
  const hour12 = normalized % 12 || 12;
  return { hour12, suffix, text: `${hour12}:00 ${suffix}` };
}

export function hourLabel(hour: number): string {
  const start = clock(hour);
  const end = clock(hour + 1);
  if (start.suffix === end.suffix) {
    return `${start.hour12}:00–${end.hour12}:00 ${start.suffix}`;
  }
  return `${start.text}–${end.text}`;
}

export function firstName(name: string): string {
  const [given] = name.trim().split(/\s+/);
  return given || "Filled";
}

export function formatPacific(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
