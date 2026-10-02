import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SchemeCard } from "@/components/SchemeCard";
import { Input } from "@/components/ui/input";
import { CATEGORIES, SCHEMES, evaluate } from "@/lib/schemes";
import { useProfile, useSavedSchemes, useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schemes/")({
  head: () => ({
    meta: [
      { title: "Discover schemes — MyYojanaAI" },
      { name: "description", content: "Search and filter central government loans, subsidies, insurance, pension and agriculture schemes." },
      { property: "og:title", content: "Discover schemes — MyYojanaAI" },
      { property: "og:description", content: "Search and filter government financial schemes." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { saved, toggle } = useSavedSchemes(user?.id);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return SCHEMES.filter((s) => (!cat || s.category === cat) && (!t || [s.name, s.summary, s.ministry, ...s.tags].join(" ").toLowerCase().includes(t)));
  }, [q, cat]);

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">Discover schemes</h1>
      <p className="mt-1 text-muted-foreground">Search by need — try "loan for business", "farmer" or "pension".</p>
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search schemes" className="h-12 bg-card pl-10" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[null, ...CATEGORIES].map((c) => (
          <button key={c ?? "all"} onClick={() => setCat(c)}
            className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>
            {c ?? "All"}
          </button>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">{list.length} schemes</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <SchemeCard key={s.id} scheme={s}
            eligibility={profile ? evaluate(s, profile) : undefined}
            saved={saved.includes(s.id)}
            onToggleSave={user ? () => toggle.mutate(s.id) : undefined} />
        ))}
      </div>
    </AppShell>
  );
}
