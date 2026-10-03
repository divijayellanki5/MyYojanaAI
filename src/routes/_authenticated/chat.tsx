import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Ask Yojana Mitra — MyYojanaAI" }, { name: "description", content: "Chat about government schemes." }] }),
  component: ChatLayout,
});

export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_threads").select("id,title,updated_at").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useNewThread() {
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return async () => {
    if (!user) return;
    const { data, error } = await supabase.from("chat_threads").insert({ user_id: user.id }).select("id").single();
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  };
}

function ChatLayout() {
  const { data: threads } = useThreads();
  const newThread = useNewThread();
  const params = useParams({ strict: false }) as { threadId?: string };
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function remove(id: string) {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["threads"] });
    if (params.threadId === id) navigate({ to: "/chat" });
  }

  return (
    <AppShell>
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          <Button onClick={newThread} className="w-full"><Plus className="h-4 w-4" />New chat</Button>
          <ul className="max-h-40 space-y-1 overflow-y-auto md:max-h-[65vh]">
            {threads?.map((t) => (
              <li key={t.id} className={cn("group flex items-center rounded-md", params.threadId === t.id ? "bg-muted" : "hover:bg-muted/60")}>
                <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm">
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </Link>
                <button aria-label="Delete conversation" onClick={() => remove(t.id)} className="px-2 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section className="min-w-0"><Outlet /></section>
      </div>
    </AppShell>
  );
}
