import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MyYojanaAI" },
      { name: "description", content: "Sign in or create your MyYojanaAI account to get personalised scheme recommendations." },
      { property: "og:title", content: "Sign in — MyYojanaAI" },
      { property: "og:description", content: "Sign in to get personalised scheme recommendations." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && navigate({ to: "/dashboard" }));
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (s && e === "SIGNED_IN") navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
        });
        if (error) throw error;
        setSent(true);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="min-h-screen">
      <div className="tricolor-rule" />
      <div className="mx-auto flex min-h-[90vh] max-w-sm flex-col justify-center px-4">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="text-center">
              <h1 className="text-xl font-semibold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation link to {email}. Open it to finish creating your account.</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
              <Button variant="outline" className="mt-5 w-full" onClick={google}>Continue with Google</Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or<div className="h-px flex-1 bg-border" /></div>
              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                )}
                <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button type="submit" className="w-full" disabled={busy}>{mode === "signin" ? "Sign in" : "Create account"}</Button>
              </form>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New here? " : "Already have an account? "}
                <button className="font-medium text-secondary hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
