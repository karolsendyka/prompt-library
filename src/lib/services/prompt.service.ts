import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import type { CreatePromptCommand, CreatedPromptDto, PaginationDTO, PromptDetailDTO, PromptListDTO } from "../../types";
import { PromptRepository, type ListPromptsQuery } from "../repositories/prompt.repository";

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
   * Retrieves a single prompt by its ID.
   *
   * @param id - The UUID of the prompt to fetch.
   * @param userId - Optional UUID of the current user to determine their vote status.
   * @returns A detailed prompt object or null if not found.
   */
  async getPrompt(id: string, userId?: string): Promise<PromptDetailDTO | null> {
    return this.promptRepository.getPromptById(id, userId);
  }

  async processVote(promptId: string, userId: string, voteValue: -1 | 0 | 1): Promise<{ new_vote_score: number }> {
    if (!userId) {
      throw new Error("User not authenticated.");
    }

    const newScore = await this.promptRepository.upsertVoteAndGetScore(promptId, userId, voteValue);
    return { new_vote_score: newScore };
  }

  async deletePrompt(promptId: string, userId: string): Promise<void> {
    if (!userId) {
      throw new Error("User not authenticated.");
    }

    const deleted = await this.promptRepository.softDeletePromptIfOwner(promptId, userId);

    if (!deleted) {
      throw new Error("Prompt not found or user not authorized to delete this prompt.");
    }
  }

  /**
   * Lists prompts with filtering, sorting, and pagination options.
   */
  async listPrompts(query: ListPromptsQuery): Promise<{ data: PromptListDTO[]; pagination: PaginationDTO }> {
    return this.promptRepository.listPrompts(query);
  }
}

export type { ListPromptsQuery };
