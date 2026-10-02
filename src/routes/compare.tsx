import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { EligibilityBadge } from "@/components/SchemeCard";
import { SCHEMES, evaluate, getScheme } from "@/lib/schemes";
import { useProfile, useSession } from "@/lib/auth";

export const Route = createFileRoute("/compare")({
  validateSearch: z.object({ ids: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Compare schemes — MyYojanaAI" },
      { name: "description", content: "Compare government schemes side by side: benefits, eligibility and documents." },
      { property: "og:title", content: "Compare schemes — MyYojanaAI" },
      { property: "og:description", content: "Compare government schemes side by side." },
    ],
  }),
  component: Compare,
});

function Compare() {
  const { ids } = Route.useSearch();
  const navigate = useNavigate({ from: "/compare" });
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const selected = (ids ?? "").split(",").filter(Boolean).map(getScheme).filter((s): s is NonNullable<typeof s> => !!s);
  const setIds = (list: string[]) => navigate({ search: { ids: list.join(",") || undefined } });

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Compare schemes</h1>
      <p className="mt-1 text-muted-foreground">Pick up to 3 schemes.</p>
      {selected.length < 3 && (
        <select className="mt-5 h-11 w-full max-w-sm rounded-md border bg-card px-3 text-sm" value=""
          onChange={(e) => e.target.value && setIds([...selected.map((s) => s.id), e.target.value])}>
          <option value="">+ Add a scheme</option>
          {SCHEMES.filter((s) => !selected.some((x) => x.id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}
      {selected.length === 0 ? (
        <p className="mt-10 text-muted-foreground">No schemes selected yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-40 p-4 text-left font-medium text-muted-foreground" />
                {selected.map((s) => (
                  <th key={s.id} className="p-4 text-left align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/schemes/$id" params={{ id: s.id }} className="font-display text-base font-semibold hover:underline">{s.name}</Link>
                      <button aria-label="Remove" onClick={() => setIds(selected.filter((x) => x.id !== s.id).map((x) => x.id))}><X className="h-4 w-4 text-muted-foreground" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_td]:p-4 [&_td]:align-top [&_tr]:border-b">
              <tr><td className="text-muted-foreground">Benefit</td>{selected.map((s) => <td key={s.id} className="font-medium text-primary">{s.benefit}</td>)}</tr>
              <tr><td className="text-muted-foreground">Category</td>{selected.map((s) => <td key={s.id}>{s.category}</td>)}</tr>
              {profile && <tr><td className="text-muted-foreground">Your eligibility</td>{selected.map((s) => <td key={s.id}><EligibilityBadge e={evaluate(s, profile)} /></td>)}</tr>}
              <tr><td className="text-muted-foreground">Conditions</td>{selected.map((s) => <td key={s.id}><ul className="list-disc space-y-1 pl-4">{s.rules.map((r) => <li key={r.label}>{r.label}</li>)}</ul></td>)}</tr>
              <tr><td className="text-muted-foreground">Documents</td>{selected.map((s) => <td key={s.id}><ul className="list-disc space-y-1 pl-4">{s.documents.map((d) => <li key={d}>{d}</li>)}</ul></td>)}</tr>
              <tr><td className="text-muted-foreground">Ministry</td>{selected.map((s) => <td key={s.id} className="text-muted-foreground">{s.ministry}</td>)}</tr>
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
