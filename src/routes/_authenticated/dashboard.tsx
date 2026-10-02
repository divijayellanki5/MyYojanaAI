import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SchemeCard } from "@/components/SchemeCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getScheme, evaluate, profileCompleteness, recommend } from "@/lib/schemes";
import { useProfile, useSavedSchemes, useSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — MyYojanaAI" }, { name: "description", content: "Your personalised scheme dashboard." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const { data: profile, isLoading } = useProfile(user?.id);
  const { saved, toggle } = useSavedSchemes(user?.id);
  if (isLoading || !profile) return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  const pct = profileCompleteness(profile);
  const recs = recommend(profile);
  const eligible = recs.filter((r) => r.eligibility.status === "eligible").length;

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Namaste{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
      <p className="mt-1 text-muted-foreground">Here's where you stand today.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Profile completeness</p>
          <p className="mt-2 font-display text-3xl font-semibold">{pct}%</p>
          <Progress value={pct} className="mt-3" />
          {pct < 100 && <Link to="/profile" className="mt-3 inline-block text-sm font-medium text-secondary hover:underline">Complete profile →</Link>}
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Likely eligible</p>
          <p className="mt-2 font-display text-3xl font-semibold text-success">{eligible}</p>
          <p className="mt-1 text-sm text-muted-foreground">{recs.length - eligible} more need a few details</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Saved schemes</p>
          <p className="mt-2 font-display text-3xl font-semibold">{saved.length}</p>
          <Link to="/schemes" className="mt-1 inline-block text-sm font-medium text-secondary hover:underline">Browse all →</Link>
        </div>
      </div>

      {pct < 50 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-ink p-6 text-ink-foreground">
          <div>
            <h2 className="text-xl font-semibold">Tell us about yourself to unlock recommendations</h2>
            <p className="mt-1 text-sm opacity-80">Takes about two minutes.</p>
          </div>
          <Button asChild variant="secondary"><Link to="/profile">Start profile <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      )}

      <div className="mt-10 flex items-end justify-between">
        <h2 className="text-2xl font-semibold">Top recommendations</h2>
        <Link to="/recommendations" className="text-sm font-medium text-secondary hover:underline">See all</Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recs.slice(0, 3).map((r) => (
          <SchemeCard key={r.scheme.id} scheme={r.scheme} eligibility={r.eligibility} saved={saved.includes(r.scheme.id)} onToggleSave={() => toggle.mutate(r.scheme.id)} />
        ))}
      </div>

      {saved.length > 0 && (
        <>
          <h2 className="mt-12 text-2xl font-semibold">Saved</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map(getScheme).filter((s): s is NonNullable<typeof s> => !!s).map((s) => (
              <SchemeCard key={s.id} scheme={s} eligibility={evaluate(s, profile)} saved onToggleSave={() => toggle.mutate(s.id)} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
