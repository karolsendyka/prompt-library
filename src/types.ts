/**
 * This file contains the Data Transfer Object (DTO) and Command Model type definitions
 * for the Corporate Prompt Library API.
 *
 * These types are derived from the database entity types defined in `@/db/database.types.ts`.
 * They represent the data structures used for API requests and responses.
 */

import type { Enums, Tables } from "./db/database.types";

// ###################################################################################
//
// ENTITY-DERIVED TYPES
//
// Base types derived directly from the database schema.
//
// ###################################################################################

/**
 * Represents the core `prompts` table entity.
 */
export type Prompt = Tables<"prompts">;

/**
 * Represents the core `tags` table entity.
 */
export type Tag = Tables<"tags">;

/**
 * Represents the core `profiles` table entity.
 */
export type Profile = Tables<"profiles">;

/**
 * Represents the core `votes` table entity.
 */
export type Vote = Tables<"votes">;

/**
 * Represents the `flag_reason` enum from the database.
 */
export type FlagReason = Enums<"flag_reason">;

/**
 * Represents the `event_type` enum from the database.
 */
export type AnalyticsEventType = Enums<"event_type">;

// ###################################################################################
//
// API DTOs (Data Transfer Objects)
//
// Types used for API responses.
//
// ###################################################################################

/**
 * DTO for a prompt item in a list.
 * This is a summary view of a prompt.
 * - `author_username` is joined from the `profiles` table.
 * - `tags` is an array of tag names.
 * - `vote_score` is a calculated value.
 */
export type PromptDto = Pick<
  Prompt,
  | "id"
  | "author_id"
  | "title"
  | "description"
  | "created_at"
  | "updated_at"
> & {
  author_username: Profile["username"];
  tags: Tag["name"][];
  vote_score: number;
};

/**
 * DTO for a paginated list of prompts.
 */
export type PaginatedPromptsDto = {
  data: PromptDto[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

/**
 * DTO for the response after successfully creating a new prompt.
 * It includes the full content and initial state.
 */
export type CreatedPromptDto = Pick<
  Prompt,
  | "id"
  | "author_id"
  | "title"
  | "description"
  | "content"
  | "created_at"
  | "updated_at"
> & {
  tags: Tag["name"][];
  vote_score: 0; // A new prompt always starts with a score of 0.
};

/**
 * DTO for a single, detailed prompt view.
 * Used for `GET /prompts/{id}` and `PUT /prompts/{id}` responses.
 * - Extends `CreatedPromptDto` with additional joined and calculated fields.
 * - `user_vote` is optional as it's only included for authenticated users viewing a specific prompt.
 */
export type FullPromptDto = Pick<
  Prompt,
  | "id"
  | "author_id"
  | "title"
  | "description"
  | "content"
  | "created_at"
  | "updated_at"
> & {
  tags: Tag["name"][];
  author_username: Profile["username"];
  vote_score: number;
  user_vote?: Vote["vote_value"]; // The current user's vote on the prompt.
};

/**
 * DTO for a tag, typically used in autocomplete lists.
 */
export type TagDto = Pick<Tag, "id" | "name">;

/**
 * DTO for a user's public profile.
 */
export type ProfileDto = Pick<Profile, "id" | "username" | "created_at">;

/**
 * DTO for the response after voting on a prompt.
 */
export type VoteOnPromptResultDto = {
  prompt_id: Prompt["id"];
  new_vote_score: number;
};

// ###################################################################################
//
// API COMMANDS
//
// Types used for API request payloads (for POST, PUT, etc.).
//
// ###################################################################################

/**
 * Command model for creating a new prompt.
 */
export type CreatePromptCommand = Pick<Prompt, "title" | "description" | "content"> & {
  tags: Tag["name"][];
};

/**
 * Command model for updating an existing prompt.
 * The structure is identical to the creation command.
 */
export type UpdatePromptCommand = CreatePromptCommand;

/**
 * Command model for casting a vote on a prompt.
 */
export type VoteOnPromptCommand = {
  vote_value: Vote["vote_value"];
};

/**
 * Command model for flagging a prompt for review.
 */
export type FlagPromptCommand = {
  reason: FlagReason;
};

/**
 * Command model for logging an analytics event.
 */
export type LogAnalyticsEventCommand = {
  event_type: AnalyticsEventType;
  prompt_id: Prompt["id"];
};
