import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Home, Search, Star, Scale, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/schemes", label: "Discover", icon: Search },
  { to: "/recommendations", label: "Recommendations", icon: Star },
  { to: "/compare", label: "Compare", icon: Scale },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-display text-lg font-semibold text-primary-foreground">य</span>
      <span className="font-display text-lg font-semibold tracking-tight">MyYojana<span className="text-secondary">AI</span></span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="tricolor-rule" />
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-muted font-medium text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button asChild size="sm"><Link to="/auth">Sign in</Link></Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="h-5 w-5" />
            {n.label === "Recommendations" ? "For you" : n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
