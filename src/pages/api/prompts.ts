import type { APIContext } from "astro";
import { z } from "zod";
import type { CreatePromptCommand } from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import { PromptService } from "../../lib/services/prompt.service";

export const prerender = false;

// Define the Zod schema for CreatePromptCommand
const CreatePromptSchema = z.object({
  title: z.string().min(6, "Title must be at least 6 characters long."),
  description: z.string().optional(),
  content: z.string().min(1, "Content cannot be empty."),
  tags: z.array(z.string()).optional(),
});

export async function POST({ request, locals }: APIContext) {
  const supabase = locals.supabase as SupabaseClient<Database>;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

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
  const authorId = session.user.id;

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
