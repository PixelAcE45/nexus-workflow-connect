/**
 * n8n MCP integration for Nexus.
 *
 * Discovers the tools exposed by the configured n8n MCP server and turns them
 * into real, callable Nexus AI tools. Nothing here is hard-coded or simulated:
 * every declaration comes from an actual `tools/list` round-trip, and every
 * execution is an actual `tools/call`.
 *
 * Server-only. Configuration lives in backend secrets:
 *   N8N_MCP_SERVER_URL   — the MCP endpoint URL (required)
 *   N8N_MCP_BEARER_TOKEN — bearer token, when the server requires auth
 */

import {
  McpError,
  McpHttpClient,
  type McpCallResult,
  type McpToolDefinition,
} from "./client.server";

export const N8N_TOOL_PREFIX = "n8n_";

export type N8nMcpStatus =
  | "NOT_CONFIGURED"
  | "CONNECTING"
  | "CONNECTED"
  | "TOOL_DISCOVERY_FAILED"
  | "DISCONNECTED"
  | "AUTHENTICATION_FAILED"
  | "EXECUTION_FAILED";

export type N8nMcpTool = {
  /** Name exposed to the AI, e.g. n8n_list_workflows */
  aiName: string;
  /** Real tool name on the MCP server */
  mcpName: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export type N8nMcpState = {
  status: N8nMcpStatus;
  configured: boolean;
  /** Host only — never the full URL with credentials. */
  serverHost: string | null;
  serverName: string | null;
  tools: N8nMcpTool[];
  error: string | null;
  checkedAt: string | null;
};

type Cache = { state: N8nMcpState; expiresAt: number };

const DISCOVERY_TTL_MS = 60_000;
let cache: Cache | null = null;
let lastExecutionError: string | null = null;

function log(stage: string, message: string) {
  // Diagnostics only — never includes tokens, URLs with credentials or user data.
  console.log(`[n8n-mcp] ${stage}: ${message}`);
}

function config(): { url: string; token?: string } | null {
  const url = process.env["N8N_MCP_SERVER_URL"]?.trim();
  if (!url) return null;
  const token = process.env["N8N_MCP_BEARER_TOKEN"]?.trim();
  return token ? { url, token } : { url };
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/** OpenAI-style function names allow [a-zA-Z0-9_-] only. */
function toAiName(mcpName: string): string {
  const safe = mcpName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  return `${N8N_TOOL_PREFIX}${safe}`;
}

function toDeclarationSchema(tool: McpToolDefinition): Record<string, unknown> {
  const schema = tool.inputSchema;
  if (schema && typeof schema === "object" && (schema as { type?: string }).type === "object") {
    return schema as Record<string, unknown>;
  }
  return { type: "object", properties: {} };
}

function emptyState(status: N8nMcpStatus, error: string | null, url?: string): N8nMcpState {
  return {
    status,
    configured: Boolean(url),
    serverHost: url ? hostOf(url) : null,
    serverName: null,
    tools: [],
    error,
    checkedAt: new Date().toISOString(),
  };
}

function statusForError(error: unknown): { status: N8nMcpStatus; message: string } {
  if (error instanceof McpError) {
    if (error.stage === "authentication")
      return { status: "AUTHENTICATION_FAILED", message: error.message };
    if (error.stage === "connection" || error.stage === "session")
      return { status: "DISCONNECTED", message: error.message };
    return { status: "TOOL_DISCOVERY_FAILED", message: error.message };
  }
  return {
    status: "DISCONNECTED",
    message: error instanceof Error ? error.message : "Unknown MCP failure.",
  };
}

function createClient(cfg: { url: string; token?: string }): McpHttpClient {
  return new McpHttpClient({
    url: cfg.url,
    token: cfg.token,
    clientName: "nexus",
    clientVersion: "1.0.0",
    log,
  });
}

/**
 * Connect to the configured n8n MCP server and discover its tools.
 * Cached briefly so a chat turn does not re-handshake per message.
 */
export async function getN8nMcpState(options?: { force?: boolean }): Promise<N8nMcpState> {
  const cfg = config();
  if (!cfg) {
    log("mcp.configuration", "N8N_MCP_SERVER_URL is not set");
    return emptyState("NOT_CONFIGURED", "No n8n MCP server URL is configured.");
  }

  if (!options?.force && cache && cache.expiresAt > Date.now()) {
    return cache.state;
  }

  log("mcp.configuration", `Using MCP server host ${hostOf(cfg.url) ?? "unknown"}`);
  const client = createClient(cfg);

  try {
    await client.connect();
    const discovered = await client.listTools();

    const tools: N8nMcpTool[] = discovered.map((tool) => ({
      aiName: toAiName(tool.name),
      mcpName: tool.name,
      description:
        tool.description?.trim() ||
        `${tool.title ?? tool.name} — tool exposed by the connected n8n MCP server.`,
      inputSchema: toDeclarationSchema(tool),
    }));

    const state: N8nMcpState = {
      status: tools.length > 0 ? "CONNECTED" : "TOOL_DISCOVERY_FAILED",
      configured: true,
      serverHost: hostOf(cfg.url),
      serverName: client.serverInfo?.name ?? null,
      tools,
      error:
        tools.length > 0
          ? null
          : "The MCP server is reachable but exposed no tools.",
      checkedAt: new Date().toISOString(),
    };

    log(
      "mcp.registration",
      `Registered ${tools.length} n8n MCP tool(s) with the Nexus tool registry`,
    );
    cache = { state, expiresAt: Date.now() + DISCOVERY_TTL_MS };
    return state;
  } catch (error) {
    const { status, message } = statusForError(error);
    log("mcp.failure", `${status}: ${message}`);
    const state = emptyState(status, message, cfg.url);
    cache = { state, expiresAt: Date.now() + 10_000 };
    return state;
  }
}

export function invalidateN8nMcpCache() {
  cache = null;
}

export function getLastExecutionError(): string | null {
  return lastExecutionError;
}

/** Model-facing declarations for the discovered tools. */
export function n8nToolDeclarations(state: N8nMcpState) {
  return state.tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.aiName,
      description: `[n8n] ${tool.description}`.slice(0, 1000),
      parameters: tool.inputSchema,
    },
  }));
}

export function isN8nToolName(name: string): boolean {
  return name.startsWith(N8N_TOOL_PREFIX);
}

/** Execute a discovered n8n MCP tool for real. */
export async function runN8nMcpTool(
  aiName: string,
  args: unknown,
): Promise<{ ok: boolean; error?: string; result?: unknown; isError?: boolean }> {
  const state = await getN8nMcpState();

  if (state.status === "NOT_CONFIGURED") {
    return { ok: false, error: "The n8n MCP server is not configured in Nexus." };
  }
  if (state.status !== "CONNECTED") {
    return {
      ok: false,
      error: `The n8n MCP server is not usable right now (${state.status}): ${state.error ?? "unknown error"}`,
    };
  }

  const tool = state.tools.find((entry) => entry.aiName === aiName);
  if (!tool) {
    return { ok: false, error: `No n8n MCP tool named ${aiName} was discovered.` };
  }

  const cfg = config();
  if (!cfg) return { ok: false, error: "The n8n MCP server is not configured in Nexus." };

  const client = createClient(cfg);
  try {
    const result: McpCallResult = await client.callTool(tool.mcpName, args ?? {});
    const text = (result.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (result.isError) {
      lastExecutionError = text || "The n8n MCP tool reported an error.";
      log("n8n.execution", `Tool ${tool.mcpName} returned an error result`);
      return { ok: false, isError: true, error: lastExecutionError };
    }

    lastExecutionError = null;
    log("n8n.execution", `Tool ${tool.mcpName} executed successfully`);
    return {
      ok: true,
      result: result.structuredContent ?? (text || result.content) ?? null,
    };
  } catch (error) {
    const { message } = statusForError(error);
    lastExecutionError = message;
    invalidateN8nMcpCache();
    log("n8n.execution", `Tool ${tool.mcpName} failed: ${message}`);
    return { ok: false, error: message };
  }
}
