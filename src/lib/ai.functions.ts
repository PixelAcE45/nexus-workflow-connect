import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ChatInput } from "./ai.schema";

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{ id: string; type: string; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
};

export const nexusChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    const { resolveChatProvider } = await import("./ai/provider.server");
    const provider = resolveChatProvider();

    const { toolDeclarations, MUTATING_TOOLS } = await import("./ai/tool-schemas");
    const { runTool } = await import("./ai/registry.server");
    const { getN8nMcpState, n8nToolDeclarations } = await import("./ai/mcp/n8n.server");
    const toolCtx = { supabase: context.supabase, userId: context.userId };

    // Real tools discovered from the connected n8n MCP server (empty when the
    // server is unconfigured or unreachable — the rest of Nexus is unaffected).
    const mcpState = await getN8nMcpState();
    const mcpDeclarations = n8nToolDeclarations(mcpState);
    const activeTools = [...toolDeclarations, ...mcpDeclarations];

    const n8nSection =
      mcpState.status === "CONNECTED" && mcpState.tools.length > 0
        ? `\n\nConnected automation platform: n8n (via MCP). You can run these real n8n tools: ${mcpState.tools
            .map((tool) => tool.aiName)
            .join(", ")}.
- Use them when the user asks about workflows, automations, executions or anything the tool descriptions cover.
- Never invent workflow names, run history or results — call the tool and report what it returned.
- If an n8n tool fails, say plainly that the n8n connection or the workflow failed and what the error said.`
        : `\n\nn8n automations are not available right now (status: ${mcpState.status}). If the user asks you to run or inspect an n8n workflow, say the n8n connection is not active instead of pretending to run anything.`;

    const systemPrompt = `You are Nexus, a calm and precise AI operating system for knowledge work, and an active co-pilot inside the user's Nexus workspace.

You can operate the workspace through tools: create_task, list_tasks, update_task, delete_task and get_workspace_summary. Tools always act on the signed-in user's own data.

Rules:
- When the user asks you to add, change, complete or remove work, call the matching task tool instead of only describing it.
- Never claim an action succeeded unless the tool returned ok: true. If a tool fails, explain what went wrong in plain language.
- Never invent workspace data. Call list_tasks or get_workspace_summary before answering questions about progress, priorities or what is pending.
- If required information is missing (for example a task description), ask one short clarifying question instead of inventing it.
- Use the conversation so far to resolve references like "it" or "that task".
- The connected data sources are tasks and, when active, n8n automations. If asked about email, calendar, files or notes, say those are not connected yet.
- Never reveal keys, ids or technical internals unless the user needs an id.
- Do not end replies with "Would you like me to help with anything else?".${n8nSection}

Formatting: reply in Markdown. Never answer with one long unbroken paragraph — use short paragraphs, and lists, short headings, bold emphasis or fenced code blocks when they genuinely help. Keep confirmations to one or two sentences.

Current date and time (UTC): ${new Date().toISOString()}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...data.messages.map((message) => ({ role: message.role, content: message.content })),
    ];

    let mutated = false;

    for (let step = 0; step < 6; step += 1) {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          tools: activeTools,
          max_tokens: 1200,
        }),
      });


      if (!response.ok) {
        const detail = await response.text();
        if (response.status === 429) throw new Error("Rate limited by the AI provider. Try again shortly.");
        if (response.status === 402) throw new Error("The AI provider reports no remaining credits.");
        throw new Error(`AI request failed (${response.status}): ${detail.slice(0, 300)}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string | null;
            tool_calls?: Array<{ id: string; type: string; function: { name: string; arguments: string } }>;
          };
        }>;
      };

      const message = payload.choices?.[0]?.message;
      const toolCalls = message?.tool_calls ?? [];

      if (toolCalls.length === 0) {
        const text = message?.content?.trim();
        if (!text) throw new Error("The AI returned an empty response.");
        return { text, mutated };
      }

      messages.push({
        role: "assistant",
        content: message?.content ?? "",
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        let args: unknown = {};
        try {
          args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        } catch {
          args = {};
        }
        const result = await runTool(call.function.name, args, toolCtx);
        if (result.ok && MUTATING_TOOLS.includes(call.function.name)) mutated = true;
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      text: "I ran into a loop working on that and stopped. Could you rephrase the request?",
      mutated,
    };
  });
