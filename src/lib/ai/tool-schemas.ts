import { z } from "zod";

// Client-safe schemas + JSON-Schema tool declarations sent to the model.
// Add new modules (notes, calendar, drive…) by appending a registry entry here
// and an executor in the matching *.tools.server.ts file.

export const PriorityEnum = z.enum(["High", "Medium", "Low"]);

export const CreateTaskArgs = z.object({
  title: z.string().trim().min(1).max(200),
  due_at: z.string().trim().min(1).max(60).optional(),
  priority: PriorityEnum.optional(),
  workspace: z.string().trim().min(1).max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const ListTasksArgs = z.object({
  status: z.enum(["open", "done", "all"]).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const UpdateTaskArgs = z.object({
  id: z.string().uuid().optional(),
  match_title: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  due_at: z.string().trim().min(1).max(60).nullable().optional(),
  priority: PriorityEnum.optional(),
  workspace: z.string().trim().min(1).max(80).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  done: z.boolean().optional(),
});

export const DeleteTaskArgs = z.object({
  id: z.string().uuid().optional(),
  match_title: z.string().trim().min(1).max(200).optional(),
});

export const WorkspaceSummaryArgs = z.object({});

const dueDescription =
  "Natural language or ISO date/time for when it is due, e.g. '2026-08-18T18:00:00' or 'tomorrow 6 PM'. Omit if the user did not say.";

export const toolDeclarations = [
  {
    type: "function" as const,
    function: {
      name: "create_task",
      description:
        "Create a task for the signed-in user. Only call when you know what the task is; if the description is missing, ask the user instead.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short description of the task." },
          due_at: { type: "string", description: dueDescription },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          workspace: { type: "string", description: "Workspace name, defaults to 'Nexus HQ'." },
          notes: { type: "string" },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_tasks",
      description:
        "List the signed-in user's tasks. Use this before answering any question about their tasks, progress or priorities.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["open", "done", "all"] },
          limit: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_task",
      description:
        "Update one of the user's tasks. Identify it by id (preferred, from list_tasks) or match_title.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          match_title: { type: "string", description: "Part of the existing task title." },
          title: { type: "string" },
          due_at: { type: "string", description: dueDescription },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
          workspace: { type: "string" },
          notes: { type: "string" },
          done: { type: "boolean", description: "Mark complete or incomplete." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_task",
      description: "Delete one of the user's tasks, by id or match_title.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          match_title: { type: "string" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_workspace_summary",
      description:
        "Retrieve aggregated stats about the user's workspace (task counts, completed this week, upcoming deadlines, top priorities). Use for 'catch me up' / 'what's my progress' style requests.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

export const MUTATING_TOOLS = ["create_task", "update_task", "delete_task"];
