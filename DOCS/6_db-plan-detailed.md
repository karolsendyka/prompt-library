# PostgreSQL Database Schema for Corporate Prompt Library

This document outlines the database schema designed for the Corporate Prompt Library MVP, based on the PRD, planning session notes, and tech stack.

## 1. ENUM Types

First, we define the custom `ENUM` types that will be used in the tables.

```sql
CREATE TYPE public.flag_reason AS ENUM (
    'Inaccurate',
    'Outdated',
    'Unclear'
);

CREATE TYPE public.event_type AS ENUM (
    'prompt_view',
    'prompt_copy'
);
```

## 2. Tables

Here is a list of all tables with their columns, data types, and constraints.

### `profiles`

Stores public user data and maintains a link to Supabase's `auth.users` table.

| Column       | Data Type     | Constraints                                               | Description                                |
| :----------- | :------------ | :-------------------------------------------------------- | :----------------------------------------- |
| `id`         | `uuid`        | `PRIMARY KEY`, `REFERENCES auth.users(id)`                | Foreign key to the `auth.users` table.     |
| `username`   | `text`        | `UNIQUE`, `NOT NULL`, `CHECK (char_length(username) > 3)` | Unique public username for the user.       |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                               | Timestamp of when the profile was created. |
| `deleted_at` | `timestamptz` | `NULL`                                                    | Timestamp for soft-deleting the profile.   |

### `prompts`

The core table containing all prompt data.

| Column        | Data Type     | Constraints                                                    | Description                               |
| :------------ | :------------ | :------------------------------------------------------------- | :---------------------------------------- |
| `id`          | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                     | Unique identifier for the prompt.         |
| `author_id`   | `uuid`        | `NOT NULL`, `REFERENCES public.profiles(id) ON DELETE CASCADE` | The user who created the prompt.          |
| `title`       | `text`        | `NOT NULL`, `CHECK (char_length(title) > 5)`                   | The title of the prompt.                  |
| `description` | `text`        | `NULL`                                                         | A brief description of the prompt.        |
| `content`     | `text`        | `NOT NULL`                                                     | The full content of the prompt.           |
| `created_at`  | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                    | Timestamp of when the prompt was created. |
| `updated_at`  | `timestamptz` | `NULL`                                                         | Timestamp of the last update.             |
| `deleted_at`  | `timestamptz` | `NULL`                                                         | Timestamp for soft-deleting the prompt.   |

### `tags`

Stores unique tags that can be associated with prompts.

| Column       | Data Type     | Constraints                                | Description                                 |
| :----------- | :------------ | :----------------------------------------- | :------------------------------------------ |
| `id`         | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the tag.              |
| `name`       | `text`        | `UNIQUE`, `NOT NULL`                       | The name of the tag (e.g., "React", "SQL"). |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                | Timestamp of when the tag was created.      |

### `prompt_tags`

A join table to manage the many-to-many relationship between `prompts` and `tags`.

| Column      | Data Type | Constraints                                                      | Description                         |
| :---------- | :-------- | :--------------------------------------------------------------- | :---------------------------------- |
| `prompt_id` | `uuid`    | `PRIMARY KEY`, `REFERENCES public.prompts(id) ON DELETE CASCADE` | Foreign key to the `prompts` table. |
| `tag_id`    | `uuid`    | `PRIMARY KEY`, `REFERENCES public.tags(id) ON DELETE CASCADE`    | Foreign key to the `tags` table.    |

### `votes`

Tracks user votes on prompts.

| Column       | Data Type     | Constraints                                                   | Description                                   |
| :----------- | :------------ | :------------------------------------------------------------ | :-------------------------------------------- |
| `id`         | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                    | Unique identifier for the vote.               |
| `prompt_id`  | `uuid`        | `NOT NULL`, `REFERENCES public.prompts(id) ON DELETE CASCADE` | The prompt being voted on.                    |
| `user_id`    | `uuid`        | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE`     | The user who cast the vote.                   |
| `vote_value` | `smallint`    | `NOT NULL`, `CHECK (vote_value IN (-1, 1))`                   | -1 for a downvote, 1 for an upvote.           |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                   | Timestamp of when the vote was cast.          |
|              |               | `UNIQUE (prompt_id, user_id)`                                 | Ensures a user can only vote once per prompt. |

### `flags`

Records instances of users flagging prompts for review.

| Column       | Data Type            | Constraints                                                   | Description                             |
| :----------- | :------------------- | :------------------------------------------------------------ | :-------------------------------------- |
| `id`         | `uuid`               | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                    | Unique identifier for the flag.         |
| `prompt_id`  | `uuid`               | `NOT NULL`, `REFERENCES public.prompts(id) ON DELETE CASCADE` | The prompt being flagged.               |
| `user_id`    | `uuid`               | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE`     | The user who flagged the prompt.        |
| `reason`     | `public.flag_reason` | `NOT NULL`                                                    | The reason for flagging the prompt.     |
| `created_at` | `timestamptz`        | `NOT NULL`, `DEFAULT now()`                                   | Timestamp of when the flag was created. |

### `analytics_events`

Logs key user actions for analytics purposes.

| Column       | Data Type           | Constraints                                        | Description                           |
| :----------- | :------------------ | :------------------------------------------------- | :------------------------------------ |
| `id`         | `bigserial`         | `PRIMARY KEY`                                      | Unique identifier for the event.      |
| `prompt_id`  | `uuid`              | `REFERENCES public.prompts(id) ON DELETE SET NULL` | The prompt related to the event.      |
| `user_id`    | `uuid`              | `REFERENCES auth.users(id) ON DELETE SET NULL`     | The user who performed the action.    |
| `event_type` | `public.event_type` | `NOT NULL`                                         | The type of event that occurred.      |
| `created_at` | `timestamptz`       | `NOT NULL`, `DEFAULT now()`                        | Timestamp of when the event occurred. |

## 3. Relationships

- **`profiles` to `auth.users`**: One-to-One. Each user in `auth.users` can have one corresponding profile.
- **`prompts` to `profiles`**: Many-to-One. A profile (user) can author many prompts.
- **`prompts` to `tags`**: Many-to-Many, facilitated by the `prompt_tags` join table.
- **`votes` to `prompts` / `auth.users`**: Many-to-One for each. A prompt can have many votes, and a user can cast many votes (but only one per prompt).
- **`flags` to `prompts` / `auth.users`**: Many-to-One for each. A prompt can be flagged multiple times by different users.
- **`analytics_events` to `prompts` / `auth.users`**: Many-to-One for each.

## 4. Indexes

- **Case-Insensitive Index on `tags.name`**: To support the autocomplete feature efficiently.
  ```sql
  CREATE INDEX idx_tags_name_case_insensitive ON public.tags (lower(name));
  ```
- **Index on `prompts.author_id`**: To quickly fetch all prompts by a specific author.
  ```sql
  CREATE INDEX idx_prompts_author_id ON public.prompts (author_id);
  ```
- **Index on `votes.prompt_id`**: To quickly calculate vote scores for a prompt.
  ```sql
  CREATE INDEX idx_votes_prompt_id ON public.votes (prompt_id);
  ```

## 5. Row-Level Security (RLS)

RLS is enabled on the `prompts` table to enforce ownership and data access rules. The soft-delete mechanism is integrated into these policies.

```sql
-- 1. Enable RLS on the prompts table
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- 2. Policy for SELECT: Users can see all non-deleted prompts
CREATE POLICY "Allow all users to see non-deleted prompts"
ON public.prompts
FOR SELECT
USING (deleted_at IS NULL);

-- 3. Policy for INSERT: Logged-in users can create prompts
CREATE POLICY "Allow logged-in users to create prompts"
ON public.prompts
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 4. Policy for UPDATE: Users can only update their own non-deleted prompts
CREATE POLICY "Allow users to update their own prompts"
ON public.prompts
FOR UPDATE
USING (auth.uid() = author_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = author_id);

-- 5. Policy for DELETE: Users can only "soft-delete" their own prompts
-- Note: The actual operation will be an UPDATE setting `deleted_at`.
-- This policy is for DELETE operations if they are ever used, but the primary mechanism is the UPDATE policy.
CREATE POLICY "Allow users to delete their own prompts"
ON public.prompts
FOR DELETE
USING (auth.uid() = author_id);
```

## 6. Additional Notes

- **Soft Deletes**: The `deleted_at` column is used to implement soft deletes for `profiles` and `prompts`. All application-level queries must filter for `deleted_at IS NULL` to exclude "deleted" records. This approach preserves data history and allows for recovery, replacing the need for `ON DELETE CASCADE` in most places.
- **Vote Score Calculation**: For the MVP, the vote score for a prompt will be calculated dynamically in the application by querying the `votes` table (e.g., `SELECT SUM(vote_value) FROM votes WHERE prompt_id = ...`). This can be optimized later with a denormalized `score` column in the `prompts` table if performance becomes an issue.
- **Standalone Authentication**: User management is handled by Supabase Auth. The `profiles` table stores additional public data not suitable for the `auth.users` table.
