import { logoutAction } from "@/app/actions";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminRoster } from "@/components/AdminRoster";
import { SubmitButton } from "@/components/SubmitButton";
import { adminPasswordConfigured, isAdmin } from "@/lib/auth";
import { loadAdminRoster } from "@/lib/roster";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: rawError } = await searchParams;
  const error = rawError?.slice(0, 300);

  if (!adminPasswordConfigured()) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
        <h1 className="font-serif text-4xl">Admin</h1>
        <p className="mt-4 text-muted">
          Set ADMIN_PASSWORD before signing in. The approve and deny actions stay behind that password.
        </p>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="flex flex-1 items-center px-6 py-16">
        <AdminLogin />
      </main>
    );
  }

  const roster = await loadAdminRoster();

  return (
    <main className="flex-1 px-6 py-16">
      {error ? (
        <p
          role="alert"
          className="mx-auto mb-6 w-full max-w-3xl rounded-2xl border border-danger/30 bg-white px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      {roster.status === "ready" ? (
        <AdminRoster pending={roster.pending} filled={roster.filled} />
      ) : (
        <div className="mx-auto w-full max-w-3xl">
          <form action={logoutAction} className="mb-6 flex justify-end">
            <SubmitButton variant="quiet" pendingLabel="Signing out…">
              Sign out
            </SubmitButton>
          </form>
          <h1 className="font-serif text-4xl">Roster</h1>
          <p role={roster.status === "error" ? "alert" : "status"} className="mt-4 text-muted">
            {roster.status === "unconfigured"
              ? "The Google Sheet is not connected yet. Add the service account settings, then refresh."
              : roster.message}
          </p>
        </div>
      )}
    </main>
  );
}
