import type { Tables, TablesInsert, TablesUpdate, Enums } from "./db/database.types";

// --- Enums from Database ---
/**
 * @description Represents the possible event types for analytics.
 * Derived from the 'event_type' enum in the database.
 */
export type EventType = Enums<"event_type">;

/**
 * @description Represents the possible reasons for flagging a prompt.
 * Derived from the 'flag_reason' enum in the database.
 */
export type FlagReason = Enums<"flag_reason">;

// --- DTOs for Prompts Resource ---

/**
 * @description Represents an item in the paginated list of prompts.
 * Derived from 'prompts' table, with additional fields for author username, tags, and calculated vote score.
 */
export type PromptListDTO = Pick<Tables<"prompts">, "id" | "title" | "description" | "created_at" | "updated_at"> & {
  author_id: Tables<"prompts">["author_id"];
  author_username: Tables<"profiles">["username"]; // Joined from profiles table
  tags: string[]; // Array of tag names
  vote_score: number; // Calculated dynamically
};

/**
 * @description Pagination metadata for list responses.
 */
export interface PaginationDTO {
  total: number;
  limit: number;
  offset: number;
}

/**
 * @description Request payload to create a new prompt.
 * Contains fields for prompt content and an array of tag names.
 */
export type CreatePromptCommand = Pick<TablesInsert<"prompts">, "title" | "description" | "content"> & {
  tags: string[];
};

/**
 * @description Response payload for a newly created prompt.
 * Derived from 'prompts' table, with additional fields for tags and an initial vote score.
 */
export type CreatedPromptDto = Pick<
  Tables<"prompts">,
  "id" | "author_id" | "title" | "description" | "content" | "created_at" | "updated_at"
> & {
  tags: string[]; // Array of tag names
  vote_score: 0; // Initial vote score for a new prompt
};

/**
 * @description Detailed prompt information, used for single prompt retrieval, creation, and update responses.
 * Derived from 'prompts' table, with additional fields for author username, tags, and calculated vote score and user's vote.
 */
export type PromptDetailDTO = Pick<
  Tables<"prompts">,
  "id" | "author_id" | "title" | "description" | "content" | "created_at" | "updated_at"
> & {
  author_username: Tables<"profiles">["username"]; // Joined from profiles table
  tags: string[]; // Array of tag names
  vote_score: number; // Calculated dynamically
  user_vote: -1 | 0 | 1; // User's vote on this prompt: -1 for downvote, 0 for no vote, 1 for upvote
};

/**
 * @description Request payload to update an existing prompt.
 * Allows partial updates to prompt fields and tags.
 */
export type UpdatePromptCommand = Partial<Pick<TablesUpdate<"prompts">, "title" | "description" | "content">> & {
  tags?: string[]; // Optional array of tag names for update
};

// --- DTOs for Tags Resource ---

/**
 * @description Represents a tag, used for listing tags (e.g., for autocomplete).
 * Derived from 'tags' table.
 */
export type TagDTO = Pick<Tables<"tags">, "id" | "name">;

// --- DTOs for Profiles Resource ---

/**
 * @description Represents a public user profile.
 * Derived from 'profiles' table.
 */
export type ProfileDTO = Pick<Tables<"profiles">, "id" | "username" | "created_at">;

// --- Command Models for Prompt Sub-Resources (Actions) ---

/**
 * @description Request payload to cast, change, or remove a vote on a prompt.
 * 'vote_value' is narrowed to specific literal values.
 */
export interface VoteCommand {
  vote_value: 1 | -1 | 0; // 1 for upvote, -1 for downvote, 0 to remove vote
}

/**
 * @description Response payload after a vote action.
 * Contains the prompt ID and the new calculated vote score.
 */
export interface VoteResponseDTO {
  prompt_id: Tables<"prompts">["id"];
  new_vote_score: number;
}

/**
 * @description Request payload to flag a prompt for review.
 * 'reason' is derived from the 'flag_reason' enum in the database.
 */
export interface FlagCommand {
  reason: FlagReason; // Reason for flagging, e.g., 'inaccurate', 'outdated', 'unclear'
}
