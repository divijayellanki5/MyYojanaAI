import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EligibilityBadge } from "@/components/SchemeCard";
import { recommend } from "@/lib/schemes";
import { useProfile, useSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — MyYojanaAI" }, { name: "description", content: "Schemes ranked for your profile." }] }),
  component: Recommendations,
});

function Recommendations() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  if (!profile) return <AppShell><p className="text-muted-foreground">Loading…</p></AppShell>;
  const recs = recommend(profile);

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Recommended for you</h1>
      <p className="mt-1 text-muted-foreground">Ranked by how well your profile matches each scheme's conditions.</p>
      {recs.length === 0 && <p className="mt-8">No matches yet. <Link to="/profile" className="text-secondary underline">Update your profile</Link>.</p>}
      <ol className="mt-8 space-y-4">
        {recs.map((r, i) => (
          <li key={r.scheme.id} className="grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[48px_1fr_220px]">
            <span className="font-display text-3xl font-semibold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <Link to="/schemes/$id" params={{ id: r.scheme.id }} className="text-lg font-semibold hover:underline">{r.scheme.name}</Link>
              <p className="text-sm text-muted-foreground">{r.scheme.summary}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Why this was recommended</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {r.eligibility.results.map((x) => (
                  <li key={x.label} className={x.status === "pass" ? "rounded bg-success-soft px-2 py-0.5 text-xs text-success" : "rounded bg-warning-soft px-2 py-0.5 text-xs text-warning"}>
                    {x.status === "pass" ? "✓" : "?"} {x.label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="font-display text-3xl font-semibold text-primary">{r.eligibility.score}%</span>
              <EligibilityBadge e={r.eligibility} />
              <p className="text-sm font-medium">{r.scheme.benefit}</p>
            </div>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}
