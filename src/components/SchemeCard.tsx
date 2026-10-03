import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { Eligibility, Scheme } from "@/lib/schemes";
import { Badge } from "@/components/ui/badge";

export function EligibilityBadge({ e }: { e: Eligibility }) {
  if (e.status === "eligible")
    return <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success"><CheckCircle2 className="h-3.5 w-3.5" />Likely eligible</span>;
  if (e.status === "partial")
    return <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning"><AlertCircle className="h-3.5 w-3.5" />Needs more info</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-1 text-xs font-medium text-destructive"><XCircle className="h-3.5 w-3.5" />Not eligible</span>;
}

export function SchemeCard({
  scheme, eligibility, saved, onToggleSave,
}: { scheme: Scheme; eligibility?: Eligibility | undefined; saved?: boolean | undefined; onToggleSave?: (() => void) | undefined }) {
  return (
    <div className="flex flex-col rounded-lg border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="secondary" className="bg-accent text-accent-foreground">{scheme.category}</Badge>
        {onToggleSave && (
          <button onClick={onToggleSave} aria-label={saved ? "Remove from saved" : "Save scheme"} className="text-muted-foreground hover:text-primary">
            {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
          </button>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug">{scheme.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{scheme.ministry}</p>
      <p className="mt-3 text-sm text-muted-foreground">{scheme.summary}</p>
      <p className="mt-3 text-sm font-semibold text-primary">{scheme.benefit}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-5">
        {eligibility ? <EligibilityBadge e={eligibility} /> : <span />}
        <Link to="/schemes/$id" params={{ id: scheme.id }} className="text-sm font-medium text-secondary hover:underline">
          View details →
        </Link>
      </div>
    </div>
  );
}
