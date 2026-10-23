import { Hero } from "@/components/Hero";
import { HourGrid } from "@/components/HourGrid";
import { Invitation, Scripture } from "@/components/LandingCopy";
import { loadPublicRoster } from "@/lib/roster";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const roster = await loadPublicRoster();

  return (
    <>
      <Hero />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <Invitation />

        {roster.status === "unconfigured" ? (
          <p
            role="status"
            className="mt-6 rounded-2xl border border-amber/30 bg-amber-soft px-4 py-3 text-sm text-amber"
          >
            Signup is not connected yet. Add the Google Sheet settings, then requests can be saved.
          </p>
        ) : null}

        {roster.status === "error" ? (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-danger/30 bg-white px-4 py-3 text-sm text-danger"
          >
            {roster.message}
          </p>
        ) : null}

        <div className="mt-8">
          <HourGrid slots={roster.slots} bookable={roster.status !== "error"} />
        </div>

        <Scripture />
      </main>

    </>
  );
}
