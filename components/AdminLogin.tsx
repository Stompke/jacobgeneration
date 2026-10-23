"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="mx-auto w-full max-w-md rounded-3xl border border-line bg-paper p-6">
      <h1 className="font-serif text-4xl">Admin</h1>
      <p className="mt-2 text-sm text-muted">Approve, deny, or release a prayer hour.</p>
      <label className="mt-6 block text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base font-normal"
        />
      </label>
      {state && !state.ok ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
