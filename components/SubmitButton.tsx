"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "danger" | "quiet";
}) {
  const { pending } = useFormStatus();
  const styles = {
    primary: "bg-pine text-white",
    danger: "bg-white text-danger border border-danger/30",
    quiet: "bg-white text-foreground border border-line",
  }[variant];

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 ${styles}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
