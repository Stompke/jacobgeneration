import { emptySlots, listSignups, SheetError, sheetConfigured, slotsFromSignups } from "@/lib/sheets";
import type { PublicSlot } from "@/lib/hours";
import type { Signup } from "@/lib/types";

export type PublicRoster =
  | { status: "unconfigured"; slots: PublicSlot[] }
  | { status: "error"; message: string; slots: PublicSlot[] }
  | { status: "ready"; slots: PublicSlot[] };

export async function loadPublicRoster(): Promise<PublicRoster> {
  if (!sheetConfigured()) {
    return { status: "unconfigured", slots: emptySlots() };
  }
  try {
    const signups = await listSignups();
    return { status: "ready", slots: slotsFromSignups(signups) };
  } catch (error) {
    return {
      status: "error",
      message: rosterErrorMessage(error),
      slots: emptySlots(),
    };
  }
}

export type AdminRosterData =
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | { status: "ready"; pending: Signup[]; filled: Signup[] };

export async function loadAdminRoster(): Promise<AdminRosterData> {
  if (!sheetConfigured()) {
    return { status: "unconfigured" };
  }
  try {
    const signups = await listSignups();
    const pending = signups
      .filter((signup) => signup.status === "pending")
      .sort((a, b) => a.hour - b.hour || a.createdAt.localeCompare(b.createdAt));
    const filled = signups
      .filter((signup) => signup.status === "approved")
      .sort((a, b) => a.hour - b.hour);
    return { status: "ready", pending, filled };
  } catch (error) {
    return { status: "error", message: rosterErrorMessage(error) };
  }
}

function rosterErrorMessage(error: unknown): string {
  if (error instanceof SheetError && error.code === "range") {
    return "The Signups tab was not found. Rename the tab to Signups and share it with the service account.";
  }
  if (error instanceof SheetError && error.code === "auth") {
    return "Google rejected the service account. Check the email, private key, and sheet sharing.";
  }
  return "The roster could not be loaded. Please try again.";
}
