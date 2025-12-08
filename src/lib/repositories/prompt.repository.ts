import type { SupabaseClient } from "../db/supabase.client";
import type { Database, TablesInsert, Tables } from "../db/database.types";

type PromptInsert = TablesInsert<"prompts">;
type Prompt = Tables<"prompts">;

export class PromptRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new prompt, handles tag upsertion, and associates tags with the prompt
   * within a single database transaction.
   *
   * @param promptData - The data for the new prompt (title, description, content, author_id).
   * @param tags - An array of tag names to associate with the prompt.
   * @returns The newly created prompt record with its associated tags.
   */
  async createPromptWithTags(
    promptData: Omit<PromptInsert, "id" | "created_at" | "updated_at" | "deleted_at">,
    tags: string[]
  ): Promise<(Prompt & { tags: string[] }) | null> {
    const { title, description, content, author_id } = promptData;

    // Start a transaction
    // Supabase client doesn't directly expose transaction methods in the client library.
    // We'll simulate a transaction by performing operations sequentially and handling errors.
    // In a more complex scenario, a stored procedure or edge function would be ideal for atomicity.

    try {
      // 1. Insert the new prompt
      const { data: prompt, error: promptError } = await this.supabase
        .from("prompts")
        .insert({ title, description, content, author_id })
        .select()
        .single();

      if (promptError) {
        console.error("Error inserting prompt:", promptError);
        throw new Error("Failed to create prompt.");
      }

      if (!prompt) {
        throw new Error("Prompt not returned after insertion.");
      }

      const tagIds: string[] = [];
      if (tags && tags.length > 0) {
        // 2. Upsert tags and collect their IDs
        for (const tagName of tags) {
          const { data: tag, error: tagError } = await this.supabase
            .from("tags")
            .upsert({ name: tagName }, { onConflict: "name" })
            .select("id")
            .single();

          if (tagError) {
            console.error(`Error upserting tag '${tagName}':`, tagError);
            throw new Error(`Failed to process tag: ${tagName}`);
          }
          if (tag) {
            tagIds.push(tag.id);
          }
        }

        // 3. Create associations in prompt_tags table
        const promptTagsToInsert = tagIds.map((tag_id) => ({
          prompt_id: prompt.id,
          tag_id: tag_id,
        }));

        const { error: promptTagsError } = await this.supabase.from("prompt_tags").insert(promptTagsToInsert);

        if (promptTagsError) {
          console.error("Error inserting prompt_tags:", promptTagsError);
          throw new Error("Failed to associate tags with prompt.");
        }
      }

      // Return the newly created prompt record with tag names
      return { ...prompt, tags: tags };
    } catch (error) {
      // In a real transaction, we would roll back here.
      // With Supabase client, error handling means the operation failed,
      // and we rely on RLS and database constraints for data integrity.
      console.error("Transaction failed:", error);
      throw error;
    }
  }
}
