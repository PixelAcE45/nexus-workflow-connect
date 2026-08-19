import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Bot, Loader2, Plus, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { nexusChat } from "@/lib/ai.functions";
import { toast } from "sonner";
import { AiResponse, ThinkingBubble } from "@/components/nexus/ai-response";
import { GlassPanel, IconTile, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Nexus AI OS" },
      {
        name: "description",
        content:
          "A calm AI workspace inside Nexus: draft, summarise, plan and analyse with your context at hand.",
      },
      { property: "og:title", content: "AI Assistant — Nexus AI OS" },
      {
        property: "og:description",
        content: "Draft, summarise, plan and analyse with the Nexus AI assistant.",
      },
    ],
  }),
  component: AssistantPage,
});

type Message = {
  id: number;
  role: "user" | "nexus";
  text: string;
  animate?: boolean;
  error?: boolean;
};

// Just enough of a beat that the thinking state reads as intentional.
const MIN_THINKING_MS = 700;



const initialMessages: Message[] = [
  {
    id: 1,
    role: "nexus",
    text: "I'm Nexus. I can answer questions, manage your tasks and catch you up on your progress — just ask.",
  },
];

const threads = [
  { title: "Product launch status", meta: "Today" },
  { title: "Q2 revenue breakdown", meta: "Yesterday" },
  { title: "Hiring plan draft", meta: "3 days ago" },
];

const capabilities = [
  "Add a task to finish physics tomorrow at 6 PM",
  "Catch me up on my progress",
  "What should I focus on?",
  "Mark the physics task as done",
];

function AssistantPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const chat = useServerFn(nexusChat);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || pending) return;
    const id = Date.now();
    const next: Message[] = [...messages, { id, role: "user", text: prompt }];
    setMessages(next);
    setDraft("");
    setPending(true);
    const startedAt = Date.now();
    try {
      const result = await chat({
        data: {
          messages: next
            .filter((message) => !message.error)
            .map((message) => ({
              role: message.role === "user" ? ("user" as const) : ("assistant" as const),
              content: message.text,
            })),

        },
      });
      const wait = MIN_THINKING_MS - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      if (result.mutated) {
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
      setMessages((current) => [
        ...current,
        { id: id + 1, role: "nexus", text: result.text, animate: true },
      ]);
    } catch (error) {
      const wait = MIN_THINKING_MS - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      const detail = error instanceof Error ? error.message : "Nexus could not answer that";
      toast.error(detail);
      setMessages((current) => [
        ...current,
        {
          id: id + 1,
          role: "nexus",
          text: `I couldn't answer that.\n\n**${detail}**\n\nTry sending it again in a moment.`,
          error: true,
        },
      ]);

    } finally {
      setPending(false);
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INTELLIGENCE"
        title="AI Assistant"
        description="A single place to think out loud. Nexus keeps your workspace context attached to every conversation."
        actions={
          <Button
            onClick={() => {
              setMessages(initialMessages);
              toast.success("New conversation started");
            }}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New chat
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <GlassPanel className="flex min-h-[520px] flex-col p-5 sm:p-6">
          <div ref={scrollRef} className="scroll-slim flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "nexus-fade-rise flex flex-row-reverse items-start gap-3"
                    : "nexus-fade-rise flex items-start gap-3"
                }
              >
                <IconTile tone={message.role === "user" ? "azure" : "violet"} className="h-9 w-9">
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </IconTile>
                <div
                  className={
                    message.role === "user"
                      ? "glass-strong max-w-[85%] rounded-2xl px-4 py-3 text-sm"
                      : "glass max-w-[85%] rounded-2xl px-4 py-3"
                  }
                >
                  {message.role === "user" ? (
                    <span className="whitespace-pre-wrap">{message.text}</span>
                  ) : (
                    <AiResponse text={message.text} animate={message.animate === true} />
                  )}
                </div>
              </div>
            ))}

            {pending ? (
              <div className="nexus-fade-rise flex items-start gap-3">
                <IconTile tone="violet" className="h-9 w-9">
                  <Bot className="h-4 w-4" />
                </IconTile>
                <ThinkingBubble />
              </div>
            ) : null}
          </div>


          <div className="glass mt-5 rounded-2xl p-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <textarea
                value={draft}
                rows={2}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(draft);
                  }
                }}
                disabled={pending}
                placeholder={pending ? "Nexus is thinking…" : "Message Nexus…"}
                className="min-w-0 resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="icon"
                aria-label="Send message"
                onClick={() => void send(draft)}
                disabled={pending}
                className="brand-gradient shrink-0 rounded-xl text-primary-foreground hover:opacity-90"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </GlassPanel>

        <aside className="space-y-5">
          <GlassPanel className="p-5">
            <SectionTitle title="Recent threads" />
            <ul className="mt-4 space-y-1">
              {threads.map((thread) => (
                <li key={thread.title}>
                  <button
                    type="button"
                    onClick={() => toast(`Opening “${thread.title}”`)}
                    className="w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-glass"
                  >
                    <span className="block truncate text-sm font-medium">{thread.title}</span>
                    <span className="block text-xs text-muted-foreground">{thread.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          </GlassPanel>

          <GlassPanel className="p-5">
            <SectionTitle title="Try asking" />
            <div className="mt-4 flex flex-wrap gap-2">
              {capabilities.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void send(item)}
                  className="glass glass-hover rounded-full px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="flex items-center gap-3">
              <IconTile tone="violet">
                <Sparkles className="h-[1.05rem] w-[1.05rem]" />
              </IconTile>
              <div className="min-w-0">
                <p className="text-sm font-medium">Context attached</p>
                <p className="text-xs text-muted-foreground">
                  3 workspaces · 12 files · calendar
                </p>
              </div>
            </div>
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}
