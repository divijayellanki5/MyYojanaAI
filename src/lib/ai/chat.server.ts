import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { SCHEMES } from "@/lib/schemes";
import { createResponsesCall } from "./responses.server";

const Body = z.object({
  threadId: z.string().uuid(),
  messages: z.array(z.any()).min(1),
});

function userClient(token: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        h.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function catalogue() {
  return SCHEMES.map(
    (s) =>
      `- [${s.name}](/schemes/${s.id}) (${s.category}) — ${s.benefit}. ${s.summary} Conditions: ${s.rules.map((r) => r.label).join("; ")}. Documents: ${s.documents.join(", ")}.`,
  ).join("\n");
}

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });

export async function handleChat(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, "Please sign in to chat.");
  const sb = userClient(token);
  const { data: auth, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !auth.user) return json(401, "Please sign in to chat.");
  const userId = auth.user.id;

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(400, "Invalid request");
  const { threadId } = parsed.data;
  const messages = parsed.data.messages as UIMessage[];

  const { data: thread } = await sb.from("chat_threads").select("id,title").eq("id", threadId).maybeSingle();
  if (!thread) return json(404, "Conversation not found");

  const last = messages[messages.length - 1]!;
  if (last.role === "user") {
    const { error } = await sb.from("chat_messages").upsert(
      { thread_id: threadId, user_id: userId, message_id: last.id, role: "user", parts: last.parts as never },
      { onConflict: "thread_id,message_id" },
    );
    if (error) return json(500, "Could not save your message");
    if (thread.title === "New chat") {
      const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
      await sb.from("chat_threads").update({ title: text.slice(0, 60) || "New chat" }).eq("id", threadId);
    }
  }

  const { data: profile } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  const system = `You are Yojana Mitra, a friendly assistant inside MyYojanaAI that helps Indian citizens understand government financial schemes (loans, subsidies, insurance, pensions, agriculture, MSME, housing, education).
Answer in the same language the user writes in. Use simple words, short paragraphs and bullet points. Keep answers under about 250 words unless asked for more.
Prefer schemes from the catalogue below and link to them using the markdown links given. If you mention a scheme outside the catalogue, say the user should verify it on the official portal. Never invent amounts or deadlines. Remind users eligibility is indicative.

User profile (may be incomplete): ${JSON.stringify(profile ?? {})}

Scheme catalogue:
${catalogue()}`;

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, "AI is not configured");

  const call = createResponsesCall(
    request,
    { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
    await convertToModelMessages(messages),
    system,
  );
  return call.response({
    originalMessages: messages,
    onFinish: async ({ responseMessage }) => {
      const { error } = await sb.from("chat_messages").upsert(
        { thread_id: threadId, user_id: userId, message_id: responseMessage.id, role: "assistant", parts: responseMessage.parts as never },
        { onConflict: "thread_id,message_id" },
      );
      if (error) console.error("save assistant message failed", error);
      await sb.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
    },
  });
}
