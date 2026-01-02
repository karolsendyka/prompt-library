import type { SupabaseClient } from "../../db/supabase.client";
import type { Database, TablesInsert, Tables } from "../../db/database.types";
import type { PaginationDTO, PromptListDTO } from "../../types";

type PromptInsert = TablesInsert<"prompts">;
type Prompt = Tables<"prompts">;
type PromptRow = Tables<"prompts"> & {
  profiles?: { username: string; deleted_at: string | null } | null;
  prompt_tags?: { tags?: { name: string } | null }[] | null;
  votes?: { vote_value: number }[] | null;
};

export interface ListPromptsQuery {
  search?: string;
  tag?: string;
  authorId?: string;
  sortBy: "created_at" | "updated_at" | "vote_score";
  order: "asc" | "desc";
  limit: number;
  offset: number;
}

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

  /**
   * Lists prompts with optional filters, tag lookup, sorting, and pagination.
   */
  async listPrompts(query: ListPromptsQuery): Promise<{ data: PromptListDTO[]; pagination: PaginationDTO }> {
    const { search, tag, authorId, sortBy, order, limit, offset } = query;
    const ascending = order === "asc";
    // vote_score is derived locally, so sorting/pagination for that field is handled in-memory below.
    const shouldManualPaginate = sortBy === "vote_score";

    const promptIdsByTag = tag ? await this.fetchPromptIdsByTag(tag) : null;
    if (tag && promptIdsByTag && promptIdsByTag.length === 0) {
      return {
        data: [],
        pagination: { total: 0, limit, offset },
      };
    }

    const applyFilters = (builder: ReturnType<SupabaseClient<Database>["from"]>) => {
      let qb = builder.is("deleted_at", null);
      qb = qb.is("profiles.deleted_at", null);
      if (authorId) {
        qb = qb.eq("author_id", authorId);
      }
      if (promptIdsByTag) {
        qb = qb.in("id", promptIdsByTag);
      }
      if (search) {
        const escaped = search.replace(/%/g, "\\%").replace(/_/g, "\\_");
        qb = qb.or(
          [`title.ilike.%${escaped}%`, `description.ilike.%${escaped}%`, `content.ilike.%${escaped}%`].join(","),
          { foreignTable: undefined }
        );
      }
      return qb;
    };

    // Count query (without range) for total
    // Need to join profiles to filter by profiles.deleted_at (used in applyFilters line 125)
    // For count queries with head: true, we need to explicitly join profiles
    let countQueryBuilder = this.supabase
      .from("prompts")
      .select("*, profiles!prompts_author_id_fkey(deleted_at)", { count: "exact", head: true });
    
    // Apply filters that don't require the join first
    countQueryBuilder = countQueryBuilder.is("deleted_at", null);
    if (authorId) {
      countQueryBuilder = countQueryBuilder.eq("author_id", authorId);
    }
    if (promptIdsByTag) {
      countQueryBuilder = countQueryBuilder.in("id", promptIdsByTag);
    }
    if (search) {
      const escaped = search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      countQueryBuilder = countQueryBuilder.or(
        [`title.ilike.%${escaped}%`, `description.ilike.%${escaped}%`, `content.ilike.%${escaped}%`].join(","),
        { foreignTable: undefined }
      );
    }
    // Apply profiles filter after the join is established
    countQueryBuilder = countQueryBuilder.is("profiles.deleted_at", null);
    
    const { count, error: countError } = await countQueryBuilder;
    if (countError) {
      console.error("Count query error:", countError);
      throw new Error(`Failed to count prompts: ${countError.message || JSON.stringify(countError)}`);
    }

    const baseSelect = `
      id,
      author_id,
      title,
      description,
      content,
      created_at,
      updated_at,
      profiles:profiles!prompts_author_id_fkey(username, deleted_at),
      prompt_tags:prompt_tags(tags:tags(name)),
      votes(vote_value)
    `;

    let dataQuery = applyFilters(this.supabase.from("prompts").select(baseSelect, { count: "exact" }));

    if (!shouldManualPaginate) {
      dataQuery = dataQuery.order(sortBy, { ascending, nullsFirst: false }).range(offset, offset + limit - 1);
    }

    const { data, error: dataError } = await dataQuery;
    if (dataError) {
      throw new Error(`Failed to fetch prompts: ${dataError.message}`);
    }

    const mapped = (data ?? [])
      .map((row: PromptRow) => this.mapPromptRow(row))
      .filter(Boolean) as PromptListDTO[];

    let finalData = mapped;
    if (shouldManualPaginate) {
      finalData = mapped
        .sort((a, b) => {
          if (a.vote_score === b.vote_score) {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          }
          return ascending ? a.vote_score - b.vote_score : b.vote_score - a.vote_score;
        })
        .slice(offset, offset + limit);
    }

    return {
      data: finalData,
      pagination: {
        total: count ?? finalData.length,
        limit,
        offset,
      },
    };
  }

  private async fetchPromptIdsByTag(tagName: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("prompt_tags")
      .select("prompt_id, tags!inner(name)")
      .eq("tags.name", tagName);

    if (error) {
      throw new Error(`Failed to fetch prompt IDs by tag: ${error.message}`);
    }

    const promptIds = new Set<string>();
    const rows = (data ?? []) as { prompt_id: string | null }[];
    rows.forEach((row: { prompt_id: string | null }) => {
      if (row.prompt_id) {
        promptIds.add(row.prompt_id);
      }
    });

    return Array.from(promptIds);
  }

  private mapPromptRow(row: PromptRow): PromptListDTO | null {
    if (!row.profiles || row.profiles.deleted_at !== null) {
      return null;
    }

    const tags =
      row.prompt_tags
        ?.map((pt) => pt.tags?.name)
        .filter((name): name is string => Boolean(name)) ?? [];

    const uniqueTags = Array.from(new Set(tags));
    const vote_score = row.votes?.reduce((sum, v) => sum + (v.vote_value ?? 0), 0) ?? 0;

    return {
      id: row.id,
      author_id: row.author_id,
      author_username: row.profiles.username,
      title: row.title,
      description: row.description,
      tags: uniqueTags,
      vote_score,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
