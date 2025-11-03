<conversation_summary>
<decisions>
1. A separate `public.profiles` table will be created for application-specific user data, linked one-to-one with Supabase's `auth.users` table.
2. A `prompt_tags` join table will be implemented for the many-to-many relationship between prompts and tags.
3. A `votes` table will be used, with a unique constraint on `(prompt_id, user_id)` to enforce the one-vote-per-user rule.
4. For the MVP, prompt vote scores will be calculated dynamically with a `SUM()` query.
5. Row-Level Security (RLS) will be enabled on the `prompts` table to enforce that users can only edit or "delete" their own prompts.
6. The `TEXT` data type will be used for the `content` column in the `prompts` table.
7. A case-insensitive index will be created on the `tags.name` column to support the autocomplete feature efficiently.
8. **Soft deletes will be implemented for prompts and profiles using a `deleted_at` timestamp column instead of hard deletes.**
9. A PostgreSQL `ENUM` type will be used for the predefined "Flag for Review" reasons.
10. A single `analytics_events` table with an `ENUM` for `event_type` will be used to log user actions like views and copies.
</decisions>

<matched_recommendations>
1. Create a `public.profiles` table with a one-to-one relationship to `auth.users` for storing user profile data.
2. Implement a `prompt_tags` join table with a composite primary key on `(prompt_id, tag_id)`.
3. Create a `votes` table with a unique constraint on `(prompt_id, user_id)` to manage voting.
4. Calculate vote scores on-the-fly for the MVP, with the option to denormalize later using triggers for performance.
5. Enable RLS on the `prompts` table with policies for `UPDATE`, `DELETE`, and `INSERT` to enforce ownership based on `auth.uid()`.
6. Use the `TEXT` data type for the `prompts.content` column.
7. Create a case-insensitive index on the `tags.name` column for efficient autocomplete functionality.
8. **Implement a soft-delete mechanism by adding a nullable `deleted_at` timestamp column to the `prompts` and `profiles` tables. Update all queries and RLS policies to filter out records where `deleted_at` is not null. This replaces the `ON DELETE CASCADE` strategy.**
9. Use a PostgreSQL `ENUM` type for storing the reasons for flagging a prompt.
10. Use a single `analytics_events` table with an `ENUM` type for the `event_type` column to log various user interactions.
</matched_recommendations>

<database_planning_summary>
The database schema for the Corporate Prompt Library MVP will be built on Supabase's PostgreSQL. The plan centers around a set of core entities derived from the product requirements.

**Main Requirements:** The schema must support user accounts, full CRUD operations for prompts, a flexible tagging system, a community voting mechanism, a feature for flagging low-quality content, and logging for basic analytics.

**Key Entities and Relationships:**
- **Users:** User identity will be managed by Supabase's `auth.users` table. A separate `public.profiles` table will hold public data like usernames and a `deleted_at` timestamp for soft deletes.
- **Prompts:** The central `prompts` table will store prompt content, have a many-to-one relationship with `profiles` (via `author_id`), and include a `deleted_at` timestamp for soft deletes.
- **Tags:** A `tags` table will store unique tag names. A `prompt_tags` join table will create the many-to-many relationship between `prompts` and `tags`.
- **Votes:** A `votes` table will link `prompts` and `users`, storing a vote value. A unique constraint on `(prompt_id, user_id)` will prevent duplicate votes.
- **Flags:** A `flags` table will record instances of users flagging prompts, including a reason stored as an `ENUM` type.
- **Analytics:** A single `analytics_events` table will log key actions (`view`, `copy`) with an `ENUM` type, linking to the relevant prompt and user.

**Security and Scalability Concerns:**
- **Security:** The primary security mechanism will be PostgreSQL's Row-Level Security (RLS). Instead of permanent deletion, a soft-delete strategy will be used. When a user "deletes" an item, an `UPDATE` operation will set the `deleted_at` timestamp. All read queries and RLS policies must be written to exclude records where `deleted_at` is not null. This preserves data history and allows for recovery.
- **Scalability:** For the MVP, performance is addressed by calculating vote scores dynamically. For future growth, this can be optimized by denormalizing the score. Efficient tag searching for the autocomplete feature will be ensured by using a case-insensitive index.
</database_planning_summary>

<unresolved_issues>
There are no unresolved issues based on the discussion. The database plan has been updated to reflect the soft-deletion requirement.
</unresolved_issues>
</conversation_summary>
