import { taskTools, type ToolContext, type ToolResult } from "./tasks.tools.server";

export type { ToolContext, ToolResult };

// Central tool registry. Future Nexus modules (notes, calendar, drive, search…)
// register their executors here; the model-facing declarations live in
// ./tool-schemas.ts. Nothing else in the AI pipeline needs to change.
export const toolRegistry: Record<string, (ctx: ToolContext, raw: unknown) => Promise<ToolResult>> = {
  ...taskTools,
};

export async function runTool(
  name: string,
  args: unknown,
  ctx: ToolContext,
): Promise<ToolResult> {
  const executor = toolRegistry[name];
  if (!executor) return { ok: false, error: `Unknown tool: ${name}` };
  try {
    return await executor(ctx, args);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Tool failed validation.",
    };
  }
}
