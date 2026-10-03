import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase.from("chat_messages").select("message_id,role,parts").eq("thread_id", threadId).order("created_at");
      if (error) throw error;
      return data.map((m) => ({ id: m.message_id, role: m.role as UIMessage["role"], parts: m.parts as UIMessage["parts"] }));
    },
    staleTime: Infinity,
  });
  if (error) return <p className="text-destructive">Could not load this conversation.</p>;
  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  return <ChatWindow key={threadId} threadId={threadId} initial={data} />;
}

const SUGGESTIONS = ["Which schemes can I apply for?", "मुझे बिज़नेस लोन चाहिए", "What documents do I need for PM-KISAN?", "Compare APY and PMJJBY"];

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const qc = useQueryClient();
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initial,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
      },
    }),
    onError: (e) => {
      const m = e.message || "";
      if (m.includes("429")) toast.error("Too many requests — please wait a moment.");
      else if (m.includes("402")) toast.error("AI credits are used up for now.");
      else toast.error(m.startsWith("{") ? (JSON.parse(m).error ?? "Something went wrong") : m || "Something went wrong");
    },
    onFinish: () => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      qc.invalidateQueries({ queryKey: ["thread-messages", threadId] });
      textRef.current?.focus();
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { textRef.current?.focus(); }, []);

  function send(text: string) {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    if (messages.length === 0) setTimeout(() => qc.invalidateQueries({ queryKey: ["threads"] }), 1500);
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] min-h-[420px] flex-col rounded-lg border bg-card">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState title="How can I help?" description="Ask about any scheme, in English or your language.">
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{s}</button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent p-0 text-foreground"}>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <p key={i} className="whitespace-pre-wrap">{p.text}</p>) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer>Thinking…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t p-3">
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputTextarea ref={textRef} placeholder="Ask about schemes, eligibility or documents…" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && false} />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">AI answers are indicative — confirm on the official portal.</p>
      </div>
    </div>
  );
}
