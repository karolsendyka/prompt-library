import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import type { CreatePromptCommand, CreatedPromptDto, PaginationDTO, PromptListDTO } from "../../types";
import { PromptRepository } from "../repositories/prompt.repository";

export interface ListPromptsQuery {
  search?: string;
  tag?: string;
  authorId?: string;
  sortBy: "created_at" | "updated_at" | "vote_score";
  order: "asc" | "desc";
  limit: number;
  offset: number;
}

export class PromptService {
  private readonly promptRepository: PromptRepository;

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.promptRepository = new PromptRepository(supabase);
  }

  /**
   * Creates a new prompt with the given data and associates it with the author.
   *
   * @param command - The command object containing the prompt's title, description, content, and tags.
   * @param authorId - The ID of the author creating the prompt.
   * @returns A DTO representing the newly created prompt.
   * @throws Error if the prompt creation fails.
   */
  async createPrompt(command: CreatePromptCommand, authorId: string): Promise<CreatedPromptDto> {
    const { title, description, content, tags } = command;

    const newPrompt = await this.promptRepository.createPromptWithTags(
      {
        title,
        description,
        content,
        author_id: authorId,
      },
      tags
    );

    if (!newPrompt) {
      throw new Error("Failed to create prompt.");
    }

    // Map the repository result to CreatedPromptDto
    const createdPromptDto: CreatedPromptDto = {
      id: newPrompt.id,
      author_id: newPrompt.author_id,
      title: newPrompt.title,
      description: newPrompt.description,
      content: newPrompt.content,
      tags: newPrompt.tags,
      vote_score: 0, // New prompts start with a vote score of 0
      created_at: newPrompt.created_at,
      updated_at: newPrompt.updated_at,
    };

    return createdPromptDto;
  }

  /**
   * Lists prompts with filtering, sorting, and pagination options.
   * Repository implementation will be added next; method is defined to align with the API handler contract.
   */
  async listPrompts(_query: ListPromptsQuery): Promise<{ data: PromptListDTO[]; pagination: PaginationDTO }> {
    // Implementation will be added in the repository layer in the next step.
    throw new Error("listPrompts is not implemented yet.");
  }
}
