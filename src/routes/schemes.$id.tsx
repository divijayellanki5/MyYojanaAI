import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, XCircle, HelpCircle, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EligibilityBadge } from "@/components/SchemeCard";
import { Button } from "@/components/ui/button";
import { evaluate, getScheme, recommend } from "@/lib/schemes";
import { useProfile, useSavedSchemes, useSession } from "@/lib/auth";

export const Route = createFileRoute("/schemes/$id")({
  loader: ({ params }) => {
    const scheme = getScheme(params.id);
    if (!scheme) throw notFound();
    return { scheme };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Scheme not found — MyYojanaAI" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.scheme;
    return {
      meta: [
        { title: `${s.name} — MyYojanaAI` },
        { name: "description", content: `${s.summary} Benefit: ${s.benefit}.` },
        { property: "og:title", content: `${s.name} — MyYojanaAI` },
        { property: "og:description", content: s.summary },
      ],
    };
  },
  notFoundComponent: () => (
    <AppShell><p>Scheme not found. <Link to="/schemes" className="text-secondary underline">Back to schemes</Link></p></AppShell>
  ),
  errorComponent: () => <AppShell><p>Could not load this scheme.</p></AppShell>,
  component: SchemeDetail,
});

function SchemeDetail() {
  const { scheme } = Route.useLoaderData();
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { saved, toggle } = useSavedSchemes(user?.id);
  const e = profile ? evaluate(scheme, profile) : null;
  const alternatives = profile && e?.status === "ineligible" ? recommend(profile).filter((r) => r.scheme.id !== scheme.id).slice(0, 3) : [];

  return (
    <AppShell>
      <Link to="/schemes" className="text-sm text-muted-foreground hover:text-foreground">← All schemes</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-medium text-secondary">{scheme.category} · {scheme.ministry}</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{scheme.name}</h1>
          <p className="mt-3 font-display text-2xl text-primary">{scheme.benefit}</p>
          <p className="mt-5 leading-relaxed text-muted-foreground">{scheme.description}</p>

          <h2 className="mt-10 text-xl font-semibold">Documents required</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {scheme.documents.map((d) => <li key={d} className="rounded-md border bg-card px-3 py-2 text-sm">{d}</li>)}
          </ul>

          <h2 className="mt-10 text-xl font-semibold">How to apply</h2>
          <ol className="mt-3 space-y-3">
            {scheme.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><a href={scheme.applyUrl} target="_blank" rel="noreferrer">Official portal <ExternalLink className="h-4 w-4" /></a></Button>
            <Button asChild variant="outline"><Link to="/compare" search={{ ids: scheme.id }}>Compare</Link></Button>
            {user && (
              <Button variant="ghost" onClick={() => toggle.mutate(scheme.id)}>
                {saved.includes(scheme.id) ? <><BookmarkCheck className="h-4 w-4" />Saved</> : <><Bookmark className="h-4 w-4" />Save</>}
              </Button>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-lg border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Your eligibility</h2>
          {!user ? (
            <div className="mt-3 text-sm text-muted-foreground">
              <Link to="/auth" className="font-medium text-secondary underline">Sign in</Link> and complete your profile to check eligibility.
            </div>
          ) : !e ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="mt-3 flex items-center justify-between">
                <EligibilityBadge e={e} />
                <span className="font-display text-3xl font-semibold text-primary">{e.score}%</span>
              </div>
              <ul className="mt-5 space-y-3">
                {e.results.map((r) => (
                  <li key={r.label} className="flex gap-2 text-sm">
                    {r.status === "pass" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : r.status === "fail" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> : <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />}
                    <div><p className="font-medium">{r.label}</p><p className="text-xs text-muted-foreground">{r.hint}</p></div>
                  </li>
                ))}
              </ul>
              {e.status === "partial" && (
                <Button asChild variant="outline" size="sm" className="mt-5 w-full"><Link to="/profile">Complete profile</Link></Button>
              )}
              {alternatives.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-sm font-medium">You may qualify for these instead</p>
                  <ul className="mt-2 space-y-1">
                    {alternatives.map((a) => (
                      <li key={a.scheme.id}><Link to="/schemes/$id" params={{ id: a.scheme.id }} className="text-sm text-secondary hover:underline">{a.scheme.name}</Link></li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
