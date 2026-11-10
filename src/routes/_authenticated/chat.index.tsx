import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useNewThread } from "./chat";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({ meta: [
    { title: "New conversation — Ask Yojana Mitra" },
    { name: "description", content: "Ask questions about government scheme eligibility, benefits and applications." },
    { property: "og:title", content: "New conversation — Ask Yojana Mitra" },
    { property: "og:description", content: "Get answers about government scheme eligibility, benefits and applications." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ChatHome,
});

function ChatHome() {
  const newThread = useNewThread();
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">मि</span>
      <h1 className="mt-4 text-2xl font-semibold">Ask Yojana Mitra</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">Ask anything about schemes — what you qualify for, which documents you need, or how to apply. Your conversations are saved here.</p>
      <Button className="mt-6" onClick={newThread}>Start a conversation</Button>
    </div>
  );
}
