import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Live status of the n8n MCP connection, derived from a real MCP handshake and
 * tool discovery — never from the mere presence of a configuration value.
 */
export const getN8nMcpStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const force = (input as { force?: boolean } | undefined)?.force;
    return { force: force === true };
  })
  .handler(async ({ data }) => {
    const { getN8nMcpState } = await import("./ai/mcp/n8n.server");
    const state = await getN8nMcpState({ force: data.force });
    return {
      status: state.status,
      configured: state.configured,
      serverHost: state.serverHost,
      serverName: state.serverName,
      error: state.error,
      checkedAt: state.checkedAt,
      tools: state.tools.map((tool) => ({
        name: tool.aiName,
        mcpName: tool.mcpName,
        description: tool.description,
      })),
    };
  });
