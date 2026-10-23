import { JWT } from "google-auth-library";
import { firstName, hourLabel, HOURS, type PublicSlot } from "@/lib/hours";
import {
  SIGNUP_STATUSES,
  type Signup,
  type SignupInput,
  type SignupStatus,
} from "@/lib/types";

const TAB = "Signups";
const HEADER = [
  "id",
  "hour",
  "name",
  "email",
  "phone",
  "note",
  "status",
  "created_at",
  "updated_at",
] as const;

const BLOCKING = new Set<SignupStatus>(["pending", "approved"]);

export class SheetError extends Error {
  constructor(
    message: string,
    readonly code: "unconfigured" | "taken" | "conflict" | "range" | "auth" | "unknown",
  ) {
    super(message);
    this.name = "SheetError";
  }
}

type SheetConfig = {
  email: string;
  key: string;
  sheetId: string;
};

function normalizeKey(value: string | undefined): string {
  let key = value?.trim() ?? "";
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

export function sheetConfig(): SheetConfig | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() ?? "";
  const key = normalizeKey(process.env.GOOGLE_PRIVATE_KEY);
  if (!email || !sheetId || !key) return null;
  return { email, key, sheetId };
}

export function sheetConfigured(): boolean {
  return sheetConfig() !== null;
}

function cell(row: readonly unknown[], index: number): string {
  const value = row[index];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function isStatus(value: string): value is SignupStatus {
  return (SIGNUP_STATUSES as readonly string[]).includes(value);
}

function parseSignup(row: readonly unknown[]): Signup | null {
  const hour = Number(cell(row, 1));
  const status = cell(row, 6);
  if (!cell(row, 0) || !Number.isInteger(hour) || hour < 0 || hour > 23 || !isStatus(status)) {
    return null;
  }
  return {
    id: cell(row, 0),
    hour,
    name: cell(row, 2),
    email: cell(row, 3),
    phone: cell(row, 4),
    note: cell(row, 5),
    status,
    createdAt: cell(row, 7),
    updatedAt: cell(row, 8),
  };
}

function friendlySheetError(status: number, body: string): SheetError {
  if (status === 401 || status === 403) {
    return new SheetError("The spreadsheet rejected the service account.", "auth");
  }
  if (body.includes("Unable to parse range") || body.includes("not found")) {
    return new SheetError("The Signups tab was not found.", "range");
  }
  return new SheetError("The spreadsheet request failed.", "unknown");
}

async function accessToken(config: SheetConfig): Promise<string> {
  try {
    const auth = new JWT({
      email: config.email,
      key: config.key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const { token } = await auth.getAccessToken();
    if (!token) {
      throw new SheetError("Google did not return an access token.", "auth");
    }
    return token;
  } catch (error) {
    if (error instanceof SheetError) throw error;
    throw new SheetError("Google rejected the service account.", "auth");
  }
}

async function sheetsFetch<T>(config: SheetConfig, path: string, init?: RequestInit): Promise<T> {
  const token = await accessToken(config);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}${path}`,
    {
      ...init,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw friendlySheetError(response.status, body);
  }
  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
}

function requireConfig(): SheetConfig {
  const config = sheetConfig();
  if (!config) {
    throw new SheetError("The signup sheet is not connected.", "unconfigured");
  }
  return config;
}

async function readRows(config: SheetConfig): Promise<unknown[][]> {
  const data = await sheetsFetch<{ values?: unknown[][] }>(
    config,
    `/values/${encodeURIComponent(`${TAB}!A:I`)}`,
  );
  const values = data.values ?? [];
  if (values.length > 0) return values;

  await sheetsFetch(
    config,
    `/values/${encodeURIComponent(`${TAB}!A1:I1`)}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [HEADER] }),
    },
  );
  return [HEADER.slice()];
}

function dataEntries(values: unknown[][]) {
  const header = cell(values[0] ?? [], 0).toLowerCase() === "id";
  const offset = header ? 1 : 0;
  return values.slice(offset).map((row, index) => ({
    row,
    sheetRow: index + offset + 1,
    signup: parseSignup(row),
  }));
}

export async function listSignups(): Promise<Signup[]> {
  const config = requireConfig();
  const values = await readRows(config);
  return dataEntries(values)
    .map((entry) => entry.signup)
    .filter((signup): signup is Signup => signup !== null);
}

function hourIsHeld(signups: Signup[], hour: number): boolean {
  return signups.some((signup) => signup.hour === hour && BLOCKING.has(signup.status));
}

export async function createSignup(input: SignupInput): Promise<Signup> {
  const config = requireConfig();
  const values = await readRows(config);
  const signups = dataEntries(values)
    .map((entry) => entry.signup)
    .filter((signup): signup is Signup => signup !== null);
  if (hourIsHeld(signups, input.hour)) {
    throw new SheetError("That hour already has a request.", "taken");
  }

  const now = new Date().toISOString();
  const signup: Signup = {
    id: crypto.randomUUID(),
    hour: input.hour,
    name: input.name,
    email: input.email,
    phone: input.phone,
    note: input.note,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  await sheetsFetch(
    config,
    `/values/${encodeURIComponent(`${TAB}!A:I`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({
        values: [[
          signup.id,
          String(signup.hour),
          signup.name,
          signup.email,
          signup.phone,
          signup.note,
          signup.status,
          signup.createdAt,
          signup.updatedAt,
        ]],
      }),
    },
  );

  return signup;
}

async function writeStatus(id: string, next: SignupStatus, allowed: SignupStatus) {
  const config = requireConfig();
  const values = await readRows(config);
  const entries = dataEntries(values);
  const current = entries.find((entry) => entry.signup?.id === id);
  const signup = current?.signup;
  if (!current || !signup) {
    throw new SheetError("That request is no longer on the roster.", "conflict");
  }
  if (signup.status !== allowed) {
    throw new SheetError(
      allowed === "pending"
        ? "That request is no longer pending."
        : "That hour is not filled.",
      "conflict",
    );
  }
  const otherApproved = entries.some(
    (entry) =>
      entry.signup !== null &&
      entry.signup.id !== id &&
      entry.signup.hour === signup.hour &&
      entry.signup.status === "approved",
  );
  if (next === "approved" && otherApproved) {
    throw new SheetError("That hour is already filled.", "taken");
  }

  const updatedAt = new Date().toISOString();
  await sheetsFetch(config, "/values:batchUpdate", {
    method: "POST",
    body: JSON.stringify({
      valueInputOption: "RAW",
      data: [
        { range: `${TAB}!G${current.sheetRow}`, values: [[next]] },
        { range: `${TAB}!I${current.sheetRow}`, values: [[updatedAt]] },
      ],
    }),
  });
}

export async function approveSignup(id: string): Promise<void> {
  await writeStatus(id, "approved", "pending");
}

export async function denySignup(id: string): Promise<void> {
  await writeStatus(id, "denied", "pending");
}

export async function releaseSignup(id: string): Promise<void> {
  await writeStatus(id, "released", "approved");
}

export function slotsFromSignups(signups: Signup[]): PublicSlot[] {
  return HOURS.map((hour) => {
    const rows = signups.filter((signup) => signup.hour === hour);
    const approved = rows
      .filter((signup) => signup.status === "approved")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (approved) {
      return {
        hour,
        label: hourLabel(hour),
        state: "filled",
        firstName: firstName(approved.name),
      };
    }
    const pending = rows.some((signup) => signup.status === "pending");
    return {
      hour,
      label: hourLabel(hour),
      state: pending ? "pending" : "open",
      firstName: null,
    };
  });
}

export function emptySlots(): PublicSlot[] {
  return slotsFromSignups([]);
}
