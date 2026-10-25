"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminPasswordConfigured,
  clearAdminCookie,
  isAdmin,
  passwordsMatch,
  setAdminCookie,
} from "@/lib/auth";
import { hourLabel } from "@/lib/hours";
import {
  approveSignup as approveRow,
  createSignup,
  denySignup as denyRow,
  releaseSignup as releaseRow,
  SheetError,
} from "@/lib/sheets";

export type SignupState = {
  ok: boolean;
  message: string;
  hour?: number;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function failure(message: string, hour?: number): SignupState {
  return { ok: false, message, hour };
}

export async function submitSignup(
  _prev: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  const hourRaw = field(formData, "hour");
  const hour = Number(hourRaw);
  const name = field(formData, "name");
  const email = field(formData, "email");
  const phone = field(formData, "phone");
  const note = field(formData, "note");

  if (!/^\d+$/.test(hourRaw) || hour > 23) {
    return failure("Choose an hour from the grid.");
  }
  if (!name || name.length > 80) {
    return failure("Enter your name.", hour);
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 120) {
    return failure("Enter a valid email address.", hour);
  }
  if (phone.length > 40) {
    return failure("Use a shorter phone number.", hour);
  }
  if (note.length > 500) {
    return failure("Keep the note under 500 characters.", hour);
  }

  try {
    await createSignup({ hour, name, email, phone, note });
  } catch (error) {
    return failure(signupErrorMessage(error), hour);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return {
    ok: true,
    hour,
    message: `Your request to join ${hourLabel(hour)} is in. It stays pending until it is confirmed.`,
  };
}

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect("/admin?error=Sign%20in%20again.");
  }
}

async function changeStatus(
  formData: FormData,
  change: (id: string) => Promise<void>,
): Promise<void> {
  await requireAdmin();
  const id = field(formData, "id");
  if (!id) {
    redirect("/admin?error=That%20request%20could%20not%20be%20found.");
  }
  try {
    await change(id);
  } catch (error) {
    redirect(`/admin?error=${encodeURIComponent(signupErrorMessage(error))}`);
  }
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function approveRequest(formData: FormData): Promise<void> {
  await changeStatus(formData, approveRow);
}

export async function denyRequest(formData: FormData): Promise<void> {
  await changeStatus(formData, denyRow);
}

export async function releaseRequest(formData: FormData): Promise<void> {
  await changeStatus(formData, releaseRow);
}

export async function loginAction(
  _prev: SignupState | null,
  formData: FormData,
): Promise<SignupState> {
  if (!adminPasswordConfigured()) {
    return failure("Set ADMIN_PASSWORD before signing in.");
  }
  const password = field(formData, "password");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!password || !passwordsMatch(password, expected)) {
    return failure("That password is not correct.");
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie();
  redirect("/admin");
}

function signupErrorMessage(error: unknown): string {
  if (error instanceof SheetError) {
    if (error.code === "unconfigured") {
      return "Signup is not connected yet. Add the Google Sheet settings and try again.";
    }
    if (error.code === "taken" || error.code === "conflict") {
      return error.message;
    }
  }
  return "The roster could not be reached. Please try again in a moment.";
}
