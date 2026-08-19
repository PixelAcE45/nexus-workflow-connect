/**
 * Resolves which chat-completions provider to use.
 *
 * Preference order:
 * 1. OpenRouter, when OPENROUTER_API_KEY is configured.
 * 2. The Lovable AI Gateway, which needs no user-supplied key.
 *
 * Both speak the OpenAI chat-completions protocol, so the caller is identical.
 */
export type ChatProvider = {
  name: "openrouter" | "lovable";
  url: string;
  apiKey: string;
  model: string;
};

export function resolveChatProvider(): ChatProvider {
  const openRouterKey = process.env["OPENROUTER_API_KEY"];
  if (openRouterKey) {
    return {
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openRouterKey,
      model: "openai/gpt-4o-mini",
    };
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    return {
      name: "lovable",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      apiKey: lovableKey,
      model: "google/gemini-3.5-flash",
    };
  }

  throw new Error(
    "No AI provider is configured. Add an OPENROUTER_API_KEY or enable the built-in AI gateway.",
  );
}
