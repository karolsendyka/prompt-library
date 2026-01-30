// src/pages/api/prompts/[id]/vote.ts
import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import { PromptService } from "@/lib/services/prompt.service";
import { z } from "zod"; // For validation

export const prerender = false;

const voteSchema = z.object({
  vote_value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

// Handles POST /api/prompts/[id]/vote
export const POST: APIRoute = async ({ params, request, locals }) => {
  const promptId = params.id;

  if (!promptId) {
    return new Response(JSON.stringify({ message: "Prompt ID is required." }), { status: 400 });
  }

  // Get user session
  const { session } = await locals.auth.getSession();
  if (!session || !session.user) {
    return new Response(JSON.stringify({ message: "Unauthorized." }), { status: 401 });
  }
  const userId = session.user.id;

  // Validate request body
  let requestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid JSON body." }), { status: 400 });
  }

  const parseResult = voteSchema.safeParse(requestBody);
  if (!parseResult.success) {
    return new Response(JSON.stringify({ message: "Invalid vote_value." }), { status: 400 });
  }
  const { vote_value } = parseResult.data;

  const promptService = new PromptService(supabaseClient);

  try {
    const { new_vote_score } = await promptService.processVote(promptId, userId, vote_value);
    return new Response(JSON.stringify({ new_vote_score }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error processing vote:", error);
    return new Response(JSON.stringify({ message: error.message || "Failed to process vote." }), { status: 500 });
  }
};
