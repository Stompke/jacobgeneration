import { approveRequest, denyRequest, logoutAction, releaseRequest } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { formatPacific, hourLabel } from "@/lib/hours";
import type { Signup } from "@/lib/types";

export function AdminRoster({
  pending,
  filled,
}: {
  pending: Signup[];
  filled: Signup[];
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Roster</h1>
          <p className="mt-2 text-sm text-muted">Pacific Time. Changes update the spreadsheet.</p>
        </div>
        <form action={logoutAction}>
          <SubmitButton variant="quiet" pendingLabel="Signing out…">
            Sign out
          </SubmitButton>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Pending</h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pending.map((signup) => (
              <li key={signup.id} className="rounded-3xl border border-line bg-paper p-5">
                <SignupDetails signup={signup} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approveRequest}>
                    <input type="hidden" name="id" value={signup.id} />
                    <SubmitButton pendingLabel="Approving…">Approve</SubmitButton>
                  </form>
                  <form action={denyRequest}>
                    <input type="hidden" name="id" value={signup.id} />
                    <SubmitButton variant="danger" pendingLabel="Denying…">
                      Deny
                    </SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Filled</h2>
        {filled.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No filled hours yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {filled.map((signup) => (
              <li key={signup.id} className="rounded-3xl border border-pine/20 bg-pine-soft p-5">
                <SignupDetails signup={signup} />
                <form action={releaseRequest} className="mt-4">
                  <input type="hidden" name="id" value={signup.id} />
                  <SubmitButton variant="quiet" pendingLabel="Releasing…">
                    Release
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SignupDetails({ signup }: { signup: Signup }) {
  return (
    <div>
      <p className="text-sm font-medium text-pine">{hourLabel(signup.hour)}</p>
      <p className="mt-1 text-lg">{signup.name}</p>
      <p className="text-sm text-muted">{signup.email}</p>
      {signup.phone ? <p className="text-sm text-muted">{signup.phone}</p> : null}
      {signup.note ? <p className="mt-2 text-sm">{signup.note}</p> : null}
      <p className="mt-2 text-xs text-muted">Requested {formatPacific(signup.createdAt)}</p>
    </div>
  );
}
