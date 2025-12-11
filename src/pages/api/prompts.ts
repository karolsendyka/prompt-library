import type { APIContext } from "astro";
import { z } from "zod";
import type { CreatePromptCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import { PromptService, type ListPromptsQuery } from "../../lib/services/prompt.service";

export const prerender = false;

// Define the Zod schema for CreatePromptCommand
const CreatePromptSchema = z.object({
  title: z.string().min(6, "Title must be at least 6 characters long."),
  description: z.string().optional(),
  content: z.string().min(1, "Content cannot be empty."),
  tags: z.array(z.string()).optional(),
});

const ListPromptsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search must not be empty when provided.")
    .max(200, "Search is too long.")
    .optional(),
  tag: z
    .string()
    .trim()
    .min(1, "Tag must not be empty when provided.")
    .max(50, "Tag is too long.")
    .optional(),
  authorId: z.string().uuid("authorId must be a valid UUID").optional(),
  sortBy: z.enum(["created_at", "updated_at", "vote_score"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET({ request, locals }: APIContext) {
  const supabase = locals.supabase as SupabaseClient<Database>;
  const promptService = new PromptService(supabase);

  const rawQuery = Object.fromEntries(new URL(request.url).searchParams) as Partial<ListPromptsQuery>;
  const parsedQuery = ListPromptsQuerySchema.safeParse(rawQuery);

  if (!parsedQuery.success) {
    return new Response(
      JSON.stringify({
        message: "Validation Error",
        errors: parsedQuery.error.flatten(),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const { data, pagination } = await promptService.listPrompts(parsedQuery.data);
    return new Response(
      JSON.stringify({
        data,
        pagination,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error listing prompts:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function POST({ request, locals }: APIContext) {
  const supabase = locals.supabase as SupabaseClient<Database>;

  // const {
    // data: { session },
  // } = await supabase.auth.getSession();

  // if (!session) {
  //   return new Response(
  //     JSON.stringify({
  //       message: "Unauthorized",
  //     }),
  //   );
  // }

  let body: CreatePromptCommand;
  try {
    body = (await request.json()) as CreatePromptCommand;
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _
  ) {
    return new Response(
      JSON.stringify({
        message: "Invalid JSON body",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const parsedBody = CreatePromptSchema.safeParse(body);

  if (!parsedBody.success) {
    return new Response(
      JSON.stringify({
        message: "Validation Error",
        errors: parsedBody.error.flatten(),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const promptService = new PromptService(supabase);
  const authorId = "57e527a4-b74b-4fd4-a80b-3a9497b775cc"; // Test UUID; //session.user.id;

  try {
    const createdPrompt = await promptService.createPrompt(
      { ...parsedBody.data, tags: parsedBody.data.tags ?? [] },
      authorId
    );
    return new Response(JSON.stringify(createdPrompt), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
