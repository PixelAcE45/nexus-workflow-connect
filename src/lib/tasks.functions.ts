import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CreateTaskArgs, PriorityEnum } from "./ai/tool-schemas";
import { z } from "zod";

const ToggleInput = z.object({ id: z.string().uuid(), done: z.boolean() });
const DeleteInput = z.object({ id: z.string().uuid() });

export type TaskDto = {
  id: string;
  title: string;
  notes: string | null;
  workspace: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export const listTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tasks")
      .select("*")
      .order("done", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as TaskDto[];
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateTaskArgs.parse(input))
  .handler(async ({ data, context }) => {
    const { parseDue } = await import("./ai/tasks.tools.server");
    const { data: row, error } = await context.supabase
      .from("tasks")
      .insert({
        user_id: context.userId,
        title: data.title,
        notes: data.notes ?? null,
        workspace: data.workspace ?? "Nexus HQ",
        priority: data.priority ?? "Medium",
        due_at: parseDue(data.due_at ?? null),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as TaskDto;
  });

export const toggleTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ToggleInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("tasks")
      .update({ done: data.done, completed_at: data.done ? new Date().toISOString() : null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setTaskPriority = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), priority: PriorityEnum }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("tasks")
      .update({ priority: data.priority })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DeleteInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
