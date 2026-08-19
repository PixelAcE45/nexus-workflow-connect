/**
 * Resolves which chat-completions provider Nexus uses for its AI core.
 *
 * Primary: NVIDIA Nemotron 3 Ultra via OpenRouter (OPENROUTER_API_KEY).
 * Fallback: the built-in Lovable AI Gateway, only when no OpenRouter key exists,
 * so the app degrades instead of hard-failing.
 *
 * Both speak the OpenAI chat-completions protocol, so callers are identical.
 * To change the model later, edit NEXUS_MODEL below — no other code changes.
 */
export const NEXUS_MODEL = {
  /** Official OpenRouter identifier for NVIDIA Nemotron 3 Ultra. */
  id: "nvidia/nemotron-3-ultra-550b-a55b",
  label: "NVIDIA Nemotron 3 Ultra",
  /** Nemotron 3 Ultra context window on OpenRouter. */
  contextWindow: 512288,
  maxOutputTokens: 4096,
  temperature: 0.4,
} as const;

const FALLBACK_MODEL = {
  id: "google/gemini-3.5-flash",
  label: "Nexus fallback core",
  maxOutputTokens: 1200,
  temperature: 0.4,
} as const;

export type ChatProvider = {
  name: "openrouter" | "lovable";
  url: string;
  apiKey: string;
  model: string;
  modelLabel: string;
  maxOutputTokens: number;
  temperature: number;
  headers: Record<string, string>;
};

export function resolveChatProvider(): ChatProvider {
  const openRouterKey = process.env["OPENROUTER_API_KEY"];
  if (openRouterKey) {
    return {
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openRouterKey,
      model: NEXUS_MODEL.id,
      modelLabel: NEXUS_MODEL.label,
      maxOutputTokens: NEXUS_MODEL.maxOutputTokens,
      temperature: NEXUS_MODEL.temperature,
      headers: {
        "HTTP-Referer": "https://nexus.lovable.app",
        "X-Title": "Nexus AI OS",
      },
    };
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    return {
      name: "lovable",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      apiKey: lovableKey,
      model: FALLBACK_MODEL.id,
      modelLabel: FALLBACK_MODEL.label,
      maxOutputTokens: FALLBACK_MODEL.maxOutputTokens,
      temperature: FALLBACK_MODEL.temperature,
      headers: {},
    };
  }

  throw new Error(
    "Nexus has no AI core configured. Add an OPENROUTER_API_KEY to enable NVIDIA Nemotron 3 Ultra.",
  );
}
