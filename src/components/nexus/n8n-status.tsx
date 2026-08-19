import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plug, RefreshCw } from "lucide-react";
import { GlassPanel, IconTile, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import { getN8nMcpStatus } from "@/lib/mcp.functions";

const LABELS: Record<string, { label: string; tone: string }> = {
  CONNECTED: { label: "Connected", tone: "text-emerald-400" },
  CONNECTING: { label: "Connecting", tone: "text-muted-foreground" },
  NOT_CONFIGURED: { label: "Not configured", tone: "text-muted-foreground" },
  DISCONNECTED: { label: "Disconnected", tone: "text-destructive" },
  AUTHENTICATION_FAILED: { label: "Authentication failed", tone: "text-destructive" },
  TOOL_DISCOVERY_FAILED: { label: "Tool discovery failed", tone: "text-destructive" },
  EXECUTION_FAILED: { label: "Execution failed", tone: "text-destructive" },
};

export function N8nStatusPanel() {
  const fetchStatus = useServerFn(getN8nMcpStatus);
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["n8n-mcp-status"],
    queryFn: () => fetchStatus({ data: { force: false } }),
    staleTime: 30_000,
  });

  const refresh = useMutation({
    mutationFn: () => fetchStatus({ data: { force: true } }),
    onSuccess: (result) => queryClient.setQueryData(["n8n-mcp-status"], result),
  });

  const status = data?.status ?? "CONNECTING";
  const meta = LABELS[status] ?? LABELS["CONNECTING"]!;

  return (
    <GlassPanel className="p-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <IconTile tone={status === "CONNECTED" ? "violet" : "azure"}>
          <Plug className="h-[1.05rem] w-[1.05rem]" />
        </IconTile>
        <div className="min-w-0">
          <SectionTitle title="n8n workflow platform" />
          <p className="mt-1 text-xs text-muted-foreground">
            {isPending ? "Checking connection…" : (
              <>
                <span className={meta.tone}>{meta.label}</span>
                {data?.serverHost ? ` · ${data.serverHost}` : null}
                {data?.tools?.length ? ` · ${data.tools.length} tools available to Nexus AI` : null}
              </>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl"
          disabled={refresh.isPending}
          onClick={() => refresh.mutate()}
        >
          <RefreshCw className={`h-4 w-4 ${refresh.isPending ? "animate-spin" : ""}`} />
          Test
        </Button>
      </div>

      {data?.error ? (
        <p className="glass mt-4 rounded-xl px-3.5 py-3 text-sm text-muted-foreground">{data.error}</p>
      ) : null}

      {data?.tools?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.tools.map((tool) => (
            <span
              key={tool.name}
              title={tool.description}
              className="glass rounded-lg px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tool.mcpName}
            </span>
          ))}
        </div>
      ) : null}
    </GlassPanel>
  );
}
