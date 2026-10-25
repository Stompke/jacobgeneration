"use client";

import { useEffect, useState, useTransition } from "react";
import { submitSignup, type SignupState } from "@/app/actions";
import type { PublicSlot } from "@/lib/hours";

export function HourGrid({
  slots,
  bookable,
}: {
  slots: PublicSlot[];
  bookable: boolean;
}) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [state, setState] = useState<SignupState | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = slots.find((slot) => slot.hour === selectedHour) ?? null;

  useEffect(() => {
    if (selectedHour === null) return;
    document.getElementById("hour-request")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedHour]);

  function requestHour(formData: FormData) {
    startTransition(async () => {
      const result = await submitSignup(null, formData);
      setState(result);
      if (result.ok) setSelectedHour(null);
    });
  }

  return (
    <div>
      {state?.ok && selectedHour === null ? (
        <p
          role="status"
          className="mb-6 rounded-2xl border border-pine/20 bg-pine-soft px-4 py-3 text-pine"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {slots.map((slot) => {
          const selectedCard = slot.hour === selectedHour;
          return (
            <button
              key={slot.hour}
              type="button"
              disabled={!bookable}
              aria-pressed={selectedCard}
              onClick={() => setSelectedHour(slot.hour)}
              className={`min-h-24 rounded-2xl border px-3 py-3 text-left transition disabled:cursor-default ${cardClass(slot.state, selectedCard)}`}
            >
              <span className="block text-sm font-medium">{slot.label}</span>
              <span className="mt-2 block text-sm text-muted">
                {slot.names.length > 0
                  ? `Filled · ${slot.names.join(", ")}`
                  : statusLabel(slot.state)}
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <form
          id="hour-request"
          className="mt-8 rounded-3xl border border-line bg-paper p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            requestHour(new FormData(event.currentTarget));
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl text-foreground">Request {selected.label}</h2>
              <p className="mt-1 text-sm text-muted">Pacific Time, every day.</p>
              <p className="mt-3 text-sm">
                {selected.names.length > 0 ? (
                  <>
                    <span className="font-medium">Currently in this hour:</span>{" "}
                    {selected.names.join(", ")}
                  </>
                ) : (
                  <span className="text-muted">No one has joined this hour yet.</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHour(null)}
              className="text-sm text-muted underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          </div>

          <input type="hidden" name="hour" value={selected.hour} />

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Name
              <input
                name="name"
                required
                autoComplete="name"
                maxLength={80}
                className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base font-normal"
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={120}
                className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base font-normal"
              />
            </label>
            <label className="block text-sm font-medium">
              Phone <span className="font-normal text-muted">(optional)</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base font-normal"
              />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              Note <span className="font-normal text-muted">(optional)</span>
              <textarea
                name="note"
                rows={3}
                maxLength={500}
                className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base font-normal"
              />
            </label>
          </div>

          {state && !state.ok && state.hour === selected.hour ? (
            <p role="alert" className="mt-4 text-sm text-danger">
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-5 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Sending…" : "Request to join"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function statusLabel(state: PublicSlot["state"]): string {
  if (state === "pending") return "Pending";
  if (state === "filled") return "Filled";
  return "Open";
}

function cardClass(state: PublicSlot["state"], selected: boolean): string {
  if (selected) return "border-pine bg-white ring-2 ring-pine";
  if (state === "filled") return "border-pine/20 bg-pine-soft text-foreground hover:border-pine/40";
  if (state === "pending") return "border-amber/30 bg-amber-soft text-foreground hover:border-pine/40";
  return "border-line bg-paper hover:border-pine/40";
}
