/**
 * Minimal MCP (Model Context Protocol) client over the Streamable HTTP
 * transport. Server-only.
 *
 * Implements just what Nexus needs:
 *   initialize -> notifications/initialized -> tools/list -> tools/call
 *
 * The transport accepts either a plain JSON response or an SSE stream
 * (`text/event-stream`), per the MCP spec, so both are parsed here.
 */

export const MCP_PROTOCOL_VERSION = "2025-06-18";

export type McpToolDefinition = {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

export type McpContentBlock = {
  type: string;
  text?: string;
  [key: string]: unknown;
};

export type McpCallResult = {
  content?: McpContentBlock[];
  structuredContent?: unknown;
  isError?: boolean;
};

export class McpError extends Error {
  stage: "connection" | "authentication" | "session" | "protocol" | "execution";
  status?: number;

  constructor(
    stage: McpError["stage"],
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "McpError";
    this.stage = stage;
    if (options?.status !== undefined) this.status = options.status;
  }
}

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id?: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

/** Pull the first JSON-RPC payload out of an SSE stream body. */
function parseSse(body: string): JsonRpcResponse | null {
  for (const rawEvent of body.split(/\r?\n\r?\n/)) {
    const dataLines = rawEvent
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());
    if (dataLines.length === 0) continue;
    try {
      const parsed = JSON.parse(dataLines.join("\n")) as JsonRpcResponse;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Ignore keep-alive / non-JSON events.
    }
  }
  return null;
}

export type McpClientOptions = {
  url: string;
  /** Optional bearer token. Never logged. */
  token?: string | undefined;
  clientName?: string;
  clientVersion?: string;
  timeoutMs?: number;
  /** Called with non-sensitive progress messages for diagnostics. */
  log?: (stage: string, message: string) => void;
};

export class McpHttpClient {
  private readonly options: McpClientOptions;
  private sessionId: string | null = null;
  private nextId = 1;
  private initialized = false;
  public serverInfo: { name?: string; version?: string } | null = null;

  constructor(options: McpClientOptions) {
    this.options = options;
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Required by the MCP Streamable HTTP spec; servers 406 without it.
      Accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
    };
    if (this.options.token) headers["Authorization"] = `Bearer ${this.options.token}`;
    if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;
    return headers;
  }

  private async send(
    method: string,
    params: unknown,
    stage: McpError["stage"],
    expectResponse = true,
  ): Promise<unknown> {
    const id = this.nextId++;
    const payload = expectResponse
      ? { jsonrpc: "2.0", id, method, params }
      : { jsonrpc: "2.0", method, params };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 20_000);

    let response: Response;
    try {
      response = await fetch(this.options.url, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      throw new McpError(
        "connection",
        error instanceof Error && error.name === "AbortError"
          ? `MCP request timed out during ${method}.`
          : `Could not reach the MCP server during ${method}.`,
        { cause: error },
      );
    } finally {
      clearTimeout(timer);
    }

    const sessionHeader = response.headers.get("mcp-session-id");
    if (sessionHeader) this.sessionId = sessionHeader;

    if (response.status === 401 || response.status === 403) {
      throw new McpError(
        "authentication",
        "The MCP server rejected the credentials (HTTP " + response.status + ").",
        { status: response.status },
      );
    }

    if (response.status === 404 && this.sessionId) {
      this.sessionId = null;
      this.initialized = false;
      throw new McpError("session", "The MCP session expired. Reconnect and retry.", {
        status: 404,
      });
    }

    const text = await response.text();

    if (!response.ok) {
      throw new McpError(
        stage,
        `MCP server returned HTTP ${response.status} for ${method}: ${text.slice(0, 300)}`,
        { status: response.status },
      );
    }

    if (!expectResponse) return null;

    const contentType = response.headers.get("content-type") ?? "";
    let message: JsonRpcResponse | null = null;
    if (contentType.includes("text/event-stream")) {
      message = parseSse(text);
    } else if (text.trim()) {
      try {
        message = JSON.parse(text) as JsonRpcResponse;
      } catch (error) {
        throw new McpError("protocol", `MCP server sent a non-JSON reply to ${method}.`, {
          cause: error,
        });
      }
    }

    if (!message) {
      throw new McpError("protocol", `MCP server sent an empty reply to ${method}.`);
    }
    if (message.error) {
      throw new McpError(stage, `MCP error on ${method}: ${message.error.message}`);
    }
    return message.result;
  }

  async connect(): Promise<void> {
    if (this.initialized) return;
    this.options.log?.("mcp.connection", "Opening MCP session");
    const result = (await this.send(
      "initialize",
      {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: {
          name: this.options.clientName ?? "nexus",
          version: this.options.clientVersion ?? "1.0.0",
        },
      },
      "session",
    )) as { serverInfo?: { name?: string; version?: string } } | null;

    this.serverInfo = result?.serverInfo ?? null;
    this.initialized = true;
    this.options.log?.("mcp.session", `MCP session established${this.sessionId ? " (session id received)" : ""}`);

    // Best-effort: some servers do not require the initialized notification.
    try {
      await this.send("notifications/initialized", {}, "session", false);
    } catch {
      // Non-fatal.
    }
  }

  async listTools(): Promise<McpToolDefinition[]> {
    await this.connect();
    const tools: McpToolDefinition[] = [];
    let cursor: string | undefined;

    do {
      const result = (await this.send(
        "tools/list",
        cursor ? { cursor } : {},
        "protocol",
      )) as { tools?: McpToolDefinition[]; nextCursor?: string } | null;
      for (const tool of result?.tools ?? []) {
        if (tool && typeof tool.name === "string") tools.push(tool);
      }
      cursor = result?.nextCursor;
    } while (cursor);

    this.options.log?.("mcp.discovery", `Discovered ${tools.length} MCP tool(s)`);
    return tools;
  }

  async callTool(name: string, args: unknown): Promise<McpCallResult> {
    await this.connect();
    this.options.log?.("mcp.invocation", `Calling MCP tool "${name}"`);
    const result = (await this.send(
      "tools/call",
      { name, arguments: args ?? {} },
      "execution",
    )) as McpCallResult | null;
    return result ?? {};
  }
}
