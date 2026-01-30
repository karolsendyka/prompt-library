// src/pages/api/prompts/[id]/index.ts
import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import { PromptService } from "@/lib/services/prompt.service";

export const prerender = false;

// Handles DELETE /api/prompts/[id]
export const DELETE: APIRoute = async ({ params, locals }) => {
  const promptId = params.id;

  if (!promptId) {
    return new Response(JSON.stringify({ message: "Prompt ID is required." }), { status: 400 });
  }

  const { session } = await locals.auth.getSession();
  if (!session || !session.user) {
    return new Response(JSON.stringify({ message: "Unauthorized." }), { status: 401 });
  }
  const userId = session.user.id;

  const promptService = new PromptService(supabaseClient);

  try {
    await promptService.deletePrompt(promptId, userId);
    return new Response(null, { status: 204 }); // No Content
  } catch (error: any) {
    console.error("Error deleting prompt:", error);
    if (error.message.includes("not authorized")) {
      return new Response(JSON.stringify({ message: error.message }), { status: 403 }); // Forbidden
    }
    if (error.message.includes("not found")) {
        return new Response(JSON.stringify({ message: error.message }), { status: 404 }); // Not Found
    }
    return new Response(JSON.stringify({ message: error.message || "Failed to delete prompt." }), { status: 500 });
  }
};
