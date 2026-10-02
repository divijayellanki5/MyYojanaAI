import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, ShieldCheck, Scale, FileCheck2, Languages, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/AppShell";
import { CATEGORIES, SCHEMES } from "@/lib/schemes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyYojanaAI — Find government schemes that fit you" },
      { name: "description", content: "Discover loans, subsidies, insurance and pensions you qualify for, with clear eligibility checks and application steps." },
      { property: "og:title", content: "MyYojanaAI — Find government schemes that fit you" },
      { property: "og:description", content: "Discover loans, subsidies, insurance and pensions you qualify for." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Target, title: "Personalised recommendations", text: "Schemes ranked against your age, income, occupation and category." },
  { icon: ShieldCheck, title: "Eligibility check", text: "See exactly which conditions you meet — and which you don't." },
  { icon: Scale, title: "Side-by-side comparison", text: "Compare benefits, documents and conditions before you apply." },
  { icon: FileCheck2, title: "Document checklist", text: "Know what to keep ready for each application." },
  { icon: Languages, title: "Built for every citizen", text: "Plain language, designed to work on any phone." },
  { icon: Lock, title: "Private by default", text: "Your profile is visible only to you." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <div className="tricolor-rule" />
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/schemes">Explore</Link></Button>
          <Button asChild size="sm"><Link to="/auth">Sign in</Link></Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-secondary">Government financial schemes, simplified</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
            Find the schemes that actually fit you.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Loans, subsidies, insurance, pensions, agriculture and MSME support — matched to your profile, with a clear reason for every recommendation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/auth">Find my schemes</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/schemes">Explore schemes</Link></Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sample eligibility result</p>
          <h3 className="mt-3 text-xl font-semibold">PM-KISAN Samman Nidhi</h3>
          <p className="text-sm text-muted-foreground">₹6,000 per year</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex justify-between rounded-md bg-success-soft px-3 py-2"><span>Is a farmer</span><span className="font-medium text-success">Meets</span></li>
            <li className="flex justify-between rounded-md bg-success-soft px-3 py-2"><span>Non-taxpayer income</span><span className="font-medium text-success">Meets</span></li>
            <li className="flex justify-between rounded-md bg-muted px-3 py-2"><span>Documents</span><span className="text-muted-foreground">Aadhaar, land record, bank</span></li>
          </ul>
          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">Match score</span>
            <span className="font-display text-3xl font-semibold text-primary">100%</span>
          </div>
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-2 px-4 py-5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{SCHEMES.length} schemes covered:</span>
          {CATEGORIES.map((c) => <span key={c}>{c}</span>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-semibold">What MyYojanaAI does</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card p-6">
              <f.icon className="h-6 w-6 text-secondary" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-semibold">Profile → Discover → Check → Compare → Apply</h2>
          <p className="mt-3 max-w-2xl opacity-80">Tell us about yourself once. We'll show you what you qualify for and how to apply.</p>
          <Button asChild size="lg" variant="secondary" className="mt-8"><Link to="/auth">Get started — it's free</Link></Button>
        </div>
      </section>
      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground">
        Information is indicative. Always confirm eligibility on the official scheme portal.
      </footer>
    </div>
  );
}
