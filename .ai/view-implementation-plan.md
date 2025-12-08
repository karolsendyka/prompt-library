# API Endpoint Implementation Plan: Create Prompt

## 1. Endpoint Overview

This document outlines the implementation plan for the `POST /prompts` API endpoint. Its purpose is to allow authenticated users to create a new prompt in the Corporate Prompt Library. The process includes validating the input, creating the prompt record, handling associated tags, and returning the newly created resource.

## 2. Request Details

- **HTTP Method**: `POST`
- **URL Structure**: `/api/prompts`
- **Authentication**: Required (via Supabase session)
- **Request Body**: The request body must be a JSON object conforming to the `CreatePromptCommand` type.

  ```json
  {
    "title": "string (min 6 chars)",
    "description": "string (optional)",
    "content": "string",
    "tags": ["string"]
  }
  ```

## 3. Used Types

- **Command Model**: `CreatePromptCommand` from `src/types.ts` will be used for the request payload.
- **DTO Model**: `CreatedPromptDto` from `src/types.ts` will be used for the success response payload.
- **Validation Schema**: A `zod` schema will be created to validate the incoming request body against the `CreatePromptCommand` structure and rules.

## 4. Response Details

- **Success Response**:
  - **Code**: `201 Created`
  - **Body**: A JSON object conforming to the `CreatedPromptDto` type.
    ```json
    {
      "id": "uuid",
      "author_id": "uuid",
      "title": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "vote_score": 0,
      "created_at": "timestamptz",
      "updated_at": null
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (with validation error details)
  - **Code**: `401 Unauthorized`
  - **Code**: `500 Internal Server Error`

## 5. Data Flow

1.  The client sends a `POST` request to `/api/prompts` with a valid JWT for an authenticated user.
2.  The Astro server-side endpoint handler at `src/pages/api/prompts.ts` receives the request.
3.  The handler retrieves the user session from `context.locals.supabase.auth`. If no session exists, it returns a `401` error.
4.  The request body is parsed and validated against the defined Zod schema. If validation fails, it returns a `400` error with details.
5.  The handler extracts the `author_id` from the user session.
6.  The handler calls the `createPrompt` function from the `PromptService` (`src/lib/services/prompt.service.ts`), passing the validated request data and the `author_id`.
7.  The `PromptService` executes a method (`createPromptWithTags`). This function performs the following actions atomically:
    a. open transaction
    b. Inserts the new prompt into the `prompts` table.
    c. Iterates through the provided list of tag names, inserting any new tags into the `tags` table (`INSERT ... ON CONFLICT DO NOTHING`).
    d. Creates the associations between the new prompt and the tags in the `prompt_tags` join table.
    e. closes transactiion
    f. Returns the newly created prompt record.
8.  The `PromptService` formats the data into the `CreatedPromptDto` shape.
9.  The endpoint handler receives the DTO from the service and sends it back to the client with a `201- Created` status.

## 6. Security Considerations

- **Authentication**: Access is restricted to authenticated users. The user's identity is established from the Supabase session managed by Astro middleware.
- **Authorization**: The `author_id` is derived from the server-side session, not the client request, preventing users from creating prompts on behalf of others. Database-level security is enforced by RLS policies.
- **Input Validation**: All incoming data is strictly validated using Zod to prevent malformed data and reduce the risk of injection attacks.
- **Data Integrity**: The use of a database transaction ensures that the prompt and its tag associations are created atomically, preventing partial data writes.

## 7. Performance Considerations

- **Database Transaction**: The logic for creating a prompt, upserting tags, and linking them involves multiple database operations.
- **Tag Handling**: The `INSERT ... ON CONFLICT` statement for tags is highly efficient for creating tags only when they do not already exist.

## 8. Implementation Steps

1.  **Create Repository**:
    - Create a new ts file `prompt.repository.ts`.
    - Define a new function `createPromptWithTags` that accepts `title`, `description`, `content`, `author_id`, and `tags` as arguments.
    - This function will encapsulate the transactional logic for inserting into the `prompts`, `tags`, and `prompt_tags` tables.
    - The function should return the newly created prompt record, including its joined tags.

2.  **Create Service Layer**:
    - Create the file `src/lib/services/prompt.service.ts`.
    - Implement a `createPrompt` function that takes a `CreatePromptCommand` and `authorId` as arguments.
    - This function will call the `createPromptWithTags`
    - It will handle any data mapping required to return a `CreatedPromptDto`.

3.  **Create API Endpoint**:
    - Create the file `src/pages/api/prompts.ts`.
    - Add `export const prerender = false;` to ensure it's a dynamic endpoint.
    - Define the Zod schema for validating the request body.

4.  **Implement POST Handler**:
    - In `src/pages/api/prompts.ts`, export an `async function POST({ request, locals }: APIContext)`.
    - Implement the authentication check using `locals.supabase.auth`.
    - Implement the request body parsing and Zod validation.
    - Add a `try...catch` block for error handling.
    - On success, call `promptService.createPrompt(...)` and return a `201` response with the resulting DTO.
    - On failure, return the appropriate `4xx` or `5xx` error response.
