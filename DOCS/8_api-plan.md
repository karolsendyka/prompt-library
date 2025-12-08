# REST API Plan

This document outlines the REST API for the Corporate Prompt Library MVP. The API is designed to be RESTful, resource-oriented, and stateless. All requests and responses will use JSON.

## 1. Resources

The API revolves around the following main resources, which are derived from the database schema:

- **Prompts**: The core content of the application. Corresponds to the `prompts` table.
- **Tags**: Keywords for categorizing prompts. Corresponds to the `tags` table.
- **Profiles**: Public user information. Corresponds to the `profiles` table.
- **Votes**: User votes on prompts. Managed as a sub-resource of Prompts.
- **Flags**: User-submitted flags for prompt review. Managed as a sub-resource of Prompts.
- **AnalyticsEvents**: Logs of user interactions. Corresponds to the `analytics_events` table.

## 2. Endpoints

All endpoints are prefixed with `/api/v1`. Authentication is required for all endpoints that modify data.

---

### 2.1. Prompts Resource

#### **List Prompts**

- **HTTP Method**: `GET`
- **URL Path**: `/prompts`
- **Description**: Retrieves a paginated list of all non-deleted prompts. Supports searching, sorting, and filtering.
- **Query Parameters**:
  - `search` (string, optional): Full-text search across title, description, and content.
  - `tag` (string, optional): Filter prompts by a specific tag name.
  - `authorId` (uuid, optional): Filter prompts by author ID.
  - `sortBy` (string, optional): Field to sort by. Defaults to `created_at`. Allowed values: `created_at`, `updated_at`, `vote_score`.
  - `order` (string, optional): Sort order. Defaults to `desc`. Allowed values: `asc`, `desc`.
  - `limit` (integer, optional): Number of results per page. Defaults to `20`.
  - `offset` (integer, optional): Number of results to skip for pagination. Defaults to `0`.
- **JSON Response Payload**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "author_id": "uuid",
        "author_username": "string",
        "title": "string",
        "description": "string",
        "tags": ["string"],
        "vote_score": "integer",
        "created_at": "timestamptz",
        "updated_at": "timestamptz"
      }
    ],
    "pagination": {
      "total": "integer",
      "limit": "integer",
      "offset": "integer"
    }
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request`

#### **Create a Prompt**

- **HTTP Method**: `POST`
- **URL Path**: `/prompts`
- **Description**: Creates a new prompt. Tags will be created if they don't exist.
- **JSON Request Payload**:
  ```json
  {
    "title": "string (min 6 chars)",
    "description": "string (optional)",
    "content": "string",
    "tags": ["string"]
  }
  ```
- **JSON Response Payload**:
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
- **Success Code**: `201 Created`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`

#### **Get a Prompt**

- **HTTP Method**: `GET`
- **URL Path**: `/prompts/{id}`
- **Description**: Retrieves a single non-deleted prompt by its ID.
- **JSON Response Payload**:
  ```json
  {
    "id": "uuid",
    "author_id": "uuid",
    "author_username": "string",
    "title": "string",
    "description": "string",
    "content": "string",
    "tags": ["string"],
    "vote_score": "integer",
    "user_vote": "integer (-1, 0, or 1)",
    "created_at": "timestamptz",
    "updated_at": "timestamptz"
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `404 Not Found`

#### **Update a Prompt**

- **HTTP Method**: `PUT`
- **URL Path**: `/prompts/{id}`
- **Description**: Updates a prompt. The user must be the author of the prompt.
- **JSON Request Payload**:
  ```json
  {
    "title": "string (min 6 chars)",
    "description": "string (optional)",
    "content": "string",
    "tags": ["string"]
  }
  ```
- **JSON Response Payload**: Same as "Get a Prompt".
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`

#### **Delete a Prompt**

- **HTTP Method**: `DELETE`
- **URL Path**: `/prompts/{id}`
- **Description**: Soft-deletes a prompt by setting the `deleted_at` timestamp. The user must be the author.
- **Success Code**: `204 No Content`
- **Error Codes**: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`

---

### 2.2. Tags Resource

#### **List Tags (for Autocomplete)**

- **HTTP Method**: `GET`
- **URL Path**: `/tags`
- **Description**: Retrieves a list of tags, primarily for the autocomplete feature.
- **Query Parameters**:
  - `search` (string, optional): Search for tags starting with the given string (case-insensitive).
  - `limit` (integer, optional): Defaults to `10`.
- **JSON Response Payload**:
  ```json
  [
    {
      "id": "uuid",
      "name": "string"
    }
  ]
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request`

---

### 2.3. Profiles Resource

#### **Get a Profile**

- **HTTP Method**: `GET`
- **URL Path**: `/profiles/{id}`
- **Description**: Retrieves a user's public profile.
- **JSON Response Payload**:
  ```json
  {
    "id": "uuid",
    "username": "string",
    "created_at": "timestamptz"
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `404 Not Found`

---

### 2.4. Prompt Sub-Resources (Actions)

#### **Vote on a Prompt**

- **HTTP Method**: `POST`
- **URL Path**: `/prompts/{id}/vote`
- **Description**: Casts, changes, or removes a vote on a prompt. The backend will handle creating or updating the vote based on the unique constraint `(prompt_id, user_id)`.
- **JSON Request Payload**:

  ```json
  {
    "vote_value": "integer"
  }
  ```

  - `1`: Upvote
  - `-1`: Downvote
  - `0`: Remove vote

- **JSON Response Payload**:
  ```json
  {
    "prompt_id": "uuid",
    "new_vote_score": "integer"
  }
  ```
- **Success Code**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

#### **Flag a Prompt**

- **HTTP Method**: `POST`
- **URL Path**: `/prompts/{id}/flag`
- **Description**: Flags a prompt for review.
- **JSON Request Payload**:

  ```json
  {
    "reason": "string"
  }
  ```

  - Allowed values: `Inaccurate`, `Outdated`, `Unclear`

- **Success Code**: `201 Created`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `409 Conflict` (if user already flagged this prompt)

## 3. Validation and Business Logic

### Validation

Input validation will be performed at the API layer before data reaches the database. Invalid requests will be rejected with a `400 Bad Request` or `422 Unprocessable Entity` status code.

- **Profiles**:
  - `username`: Required, unique, must be longer than 3 characters.
- **Prompts**:
  - `title`: Required, must be longer than 5 characters.
  - `content`: Required.
  - `tags`: Must be an array of strings.
- **Votes**:
  - `vote_value`: Required, must be `1`, `-1`, or `0`.
- **Flags**:
  - `reason`: Required, must be one of the predefined `flag_reason` enum values.
- **AnalyticsEvents**:
  - `event_type`: Required, must be one of the predefined `event_type` enum values.
  - `prompt_id`: Must be a valid UUID of an existing prompt.

### Business Logic

- **Vote Calculation**: The `vote_score` for a prompt is calculated dynamically by summing the `vote_value` from the `votes` table for that prompt. This is included in `GET /prompts` and `GET /prompts/{id}` responses.
- **User's Vote**: The `GET /prompts/{id}` endpoint will also return the current authenticated user's vote (`user_vote`) on that prompt (1, -1, or 0 if no vote).
- **Tag Management**: When creating or updating a prompt, the backend will process the `tags` array. For each tag name, it will perform a case-insensitive lookup in the `tags` table. If a tag exists, its ID is used. If not, a new tag is created. The `prompt_tags` table is then updated accordingly.
- **Vote Upsert**: The `POST /prompts/{id}/vote` endpoint uses an "upsert" logic. It attempts to insert a new vote. If a vote from the user for that prompt already exists (violating the unique constraint), it updates the existing vote's `vote_value`. If the new value is `0`, the vote row is deleted.
- **Soft Deletes**: `DELETE /prompts/{id}` performs a soft delete by setting the `deleted_at` field. All `GET` endpoints for prompts are filtered to exclude records where `deleted_at` is not `NULL`.
