import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  CreateTaskArgs,
  DeleteTaskArgs,
  ListTasksArgs,
  UpdateTaskArgs,
} from "./tool-schemas";

export type ToolContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

export type ToolResult = { ok: boolean; [key: string]: unknown };

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

const DAY_MS = 86_400_000;

/** Best-effort natural-language -> ISO timestamp. Returns null when unparsable. */
export function parseDue(input: string | null | undefined): string | null {
  if (!input) return null;
  const text = input.trim().toLowerCase();
  const direct = Date.parse(input);
  if (!Number.isNaN(direct) && /\d{4}-\d{2}-\d{2}/.test(input)) {
    return new Date(direct).toISOString();
  }

  const now = new Date();
  const base = new Date(now.getTime());
  let matched = false;

  if (/\btomorrow\b/.test(text)) {
    base.setTime(base.getTime() + DAY_MS);
    matched = true;
  } else if (/\bday after tomorrow\b/.test(text)) {
    base.setTime(base.getTime() + 2 * DAY_MS);
    matched = true;
  } else if (/\b(today|tonight|this evening)\b/.test(text)) {
    matched = true;
  } else {
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const index = weekdays.findIndex((day) => text.includes(day));
    if (index >= 0) {
      const delta = (index - base.getDay() + 7) % 7 || 7;
      base.setTime(base.getTime() + delta * DAY_MS);
      matched = true;
    }
  }

  const time = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (time) {
    let hour = Number(time[1]) % 12;
    if (time[3] === "pm") hour += 12;
    base.setHours(hour, Number(time[2] ?? 0), 0, 0);
    matched = true;
  } else {
    const time24 = text.match(/\b(\d{1,2}):(\d{2})\b/);
    if (time24) {
      base.setHours(Number(time24[1]), Number(time24[2]), 0, 0);
      matched = true;
    } else if (/\btonight|this evening\b/.test(text)) {
      base.setHours(19, 0, 0, 0);
    } else if (matched) {
      base.setHours(9, 0, 0, 0);
    }
  }

  if (!matched && !Number.isNaN(direct)) return new Date(direct).toISOString();
  return matched ? base.toISOString() : null;
}

function shape(task: TaskRow) {
  return {
    id: task.id,
    title: task.title,
    workspace: task.workspace,
    priority: task.priority,
    done: task.done,
    due_at: task.due_at,
    notes: task.notes,
    completed_at: task.completed_at,
    created_at: task.created_at,
  };
}

async function findTask(
  ctx: ToolContext,
  args: { id?: string | undefined; match_title?: string | undefined },
): Promise<{ task?: TaskRow; error?: string }> {
  if (args.id) {
    const { data, error } = await ctx.supabase.from("tasks").select("*").eq("id", args.id).maybeSingle();
    if (error) return { error: error.message };
    if (!data) return { error: "No task found with that id." };
    return { task: data };
  }
  if (args.match_title) {
    const { data, error } = await ctx.supabase
      .from("tasks")
      .select("*")
      .ilike("title", `%${args.match_title}%`)
      .order("created_at", { ascending: false })
      .limit(5);
    if (error) return { error: error.message };
    if (!data || data.length === 0) return { error: `No task matching “${args.match_title}”.` };
    if (data.length > 1) {
      return {
        error: `Multiple tasks match “${args.match_title}”: ${data
          .map((task) => task.title)
          .join(", ")}. Ask the user which one.`,
      };
    }
    return { task: data[0]! };
  }
  return { error: "Provide either id or match_title to identify the task." };
}

export const taskTools: Record<string, (ctx: ToolContext, raw: unknown) => Promise<ToolResult>> = {
  create_task: async (ctx, raw) => {
    const args = CreateTaskArgs.parse(raw);
    const due = parseDue(args.due_at ?? null);
    const { data, error } = await ctx.supabase
      .from("tasks")
      .insert({
        user_id: ctx.userId,
        title: args.title,
        notes: args.notes ?? null,
        workspace: args.workspace ?? "Nexus HQ",
        priority: args.priority ?? "Medium",
        due_at: due,
      })
      .select("*")
      .single();
    if (error) return { ok: false, error: error.message };
    return {
      ok: true,
      task: shape(data),
      note:
        args.due_at && !due
          ? `Could not interpret the due time “${args.due_at}”; saved without a deadline.`
          : undefined,
    };
  },

  list_tasks: async (ctx, raw) => {
    const args = ListTasksArgs.parse(raw ?? {});
    let query = ctx.supabase
      .from("tasks")
      .select("*")
      .order("done", { ascending: true })
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(args.limit ?? 30);
    if (args.status === "open") query = query.eq("done", false);
    if (args.status === "done") query = query.eq("done", true);
    const { data, error } = await query;
    if (error) return { ok: false, error: error.message };
    return { ok: true, count: data.length, tasks: data.map(shape) };
  },

  update_task: async (ctx, raw) => {
    const args = UpdateTaskArgs.parse(raw);
    const found = await findTask(ctx, { id: args.id, match_title: args.match_title });
    if (!found.task) return { ok: false, error: found.error };

    const patch: Database["public"]["Tables"]["tasks"]["Update"] = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.priority !== undefined) patch.priority = args.priority;
    if (args.workspace !== undefined) patch.workspace = args.workspace;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.due_at !== undefined) patch.due_at = args.due_at === null ? null : parseDue(args.due_at);
    if (args.done !== undefined) {
      patch.done = args.done;
      patch.completed_at = args.done ? new Date().toISOString() : null;
    }
    if (Object.keys(patch).length === 0) return { ok: false, error: "Nothing to update." };

    const { data, error } = await ctx.supabase
      .from("tasks")
      .update(patch)
      .eq("id", found.task.id)
      .select("*")
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, task: shape(data) };
  },

  delete_task: async (ctx, raw) => {
    const args = DeleteTaskArgs.parse(raw);
    const found = await findTask(ctx, { id: args.id, match_title: args.match_title });
    if (!found.task) return { ok: false, error: found.error };
    const { error } = await ctx.supabase.from("tasks").delete().eq("id", found.task.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, deleted: { id: found.task.id, title: found.task.title } };
  },

  get_workspace_summary: async (ctx) => {
    const { data, error } = await ctx.supabase.from("tasks").select("*");
    if (error) return { ok: false, error: error.message };

    const now = Date.now();
    const weekAgo = now - 7 * DAY_MS;
    const open = data.filter((task) => !task.done);
    const done = data.filter((task) => task.done);

    return {
      ok: true,
      available_sources: ["tasks"],
      unavailable_sources: ["email", "calendar", "files", "notes"],
      totals: { all: data.length, open: open.length, completed: done.length },
      completed_last_7_days: done.filter(
        (task) => task.completed_at && Date.parse(task.completed_at) >= weekAgo,
      ).length,
      overdue: open
        .filter((task) => task.due_at && Date.parse(task.due_at) < now)
        .map((task) => ({ title: task.title, due_at: task.due_at })),
      due_next_48h: open
        .filter(
          (task) =>
            task.due_at &&
            Date.parse(task.due_at) >= now &&
            Date.parse(task.due_at) <= now + 2 * DAY_MS,
        )
        .map((task) => ({ title: task.title, due_at: task.due_at })),
      high_priority_open: open
        .filter((task) => task.priority === "High")
        .map((task) => ({ title: task.title, due_at: task.due_at })),
      workspaces: Array.from(new Set(data.map((task) => task.workspace))),
    };
  },
};
