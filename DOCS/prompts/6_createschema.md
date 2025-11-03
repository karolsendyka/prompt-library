You are a database architect whose task is to create a PostgreSQL database schema based on information provided from planning sessions, a Product Requirements Document (PRD), and the tech stack. Your goal is to design an efficient and scalable database structure that meets project requirements.

1. <prd>

</prd>

This is the Product Requirements Document that specifies features, functionalities, and project requirements.

2. <session_notes>
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
</session_notes>

These are notes from the database schema planning session. They may contain important decisions, considerations, and specific requirements discussed during the meeting.

3. <tech_stack>
{{tech-stack}} <- replace with reference to tech-stack.md
</tech_stack>

Describes the technology stack that will be used in the project, which may influence database design decisions.

Follow these steps to create the database schema:

1. Carefully analyze session notes, identifying key entities, attributes, and relationships discussed during the planning session.
2. Review the PRD to ensure that all required features and functionalities are supported by the database schema.
3. Analyze the tech stack and ensure that the database design is optimized for the chosen technologies.

4. Create a comprehensive database schema that includes:
   a. Tables with appropriate column names and data types
   b. Primary keys and foreign keys
   c. Indexes to improve query performance
   d. Any necessary constraints (e.g., uniqueness, not null)

5. Define relationships between tables, specifying cardinality (one-to-one, one-to-many, many-to-many) and any junction tables required for many-to-many relationships.

6. Develop PostgreSQL policies for row-level security (RLS), if applicable, based on requirements specified in session notes or the PRD.

7. Ensure the schema follows database design best practices, including normalization to the appropriate level (typically 3NF, unless denormalization is justified for performance reasons).

The final output should have the following structure:
```markdown
1. List of tables with their columns, data types, and constraints
2. Relationships between tables
3. Indexes
4. PostgreSQL policies (if applicable)
5. Any additional notes or explanations about design decisions
```

Your response should provide only the final database schema in markdown format, which you will save in the file .ai/db-plan.md without including the thinking process or intermediate steps. Ensure the schema is comprehensive, well-organized, and ready to use as a basis for creating database migrations.