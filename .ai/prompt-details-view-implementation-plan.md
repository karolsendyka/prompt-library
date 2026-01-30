# View Implementation Plan: Prompt Details

## 1. Overview
The **Prompt Details View** is a dedicated page that displays the full content of a specific prompt. It serves as the primary consumption point for users, allowing them to read, copy, vote on, and manage (if they are the author) a prompt. The view is designed with a focus on readability (syntax highlighting) and ease of use (one-click actions).

## 2. View Routing
- **URL Path**: `/prompts/[id]`
- **Route Handling**: Handled by Astro's dynamic routing mechanism.
- **Example**: `/prompts/123e4567-e89b-12d3-a456-426614174000`

## 3. Component Structure
The view uses a hybrid rendering approach: **Server-Side Rendering (SSR)** for the main content (SEO, performance) and **React Islands** for interactive elements.

```
src/pages/prompts/[id].astro (Page Root)
└── Layout
    └── main.container
        ├── Breadcrumbs (Astro)
        ├── PromptHeader (Astro)
        │   ├── Title
        │   ├── Meta (Author, Date)
        │   └── Tags List
        ├── PromptContent (Astro)
        │   └── CodeBlock (Shiki/Pre)
        └── PromptActionsBar (div)
            ├── VoteControl (React)
            ├── CopyButton (React)
            └── OwnerActions (React, Conditional)
                ├── EditButton (Link)
                └── DeleteButton (Button + Dialog)
```

## 4. Component Details

### `src/pages/prompts/[id].astro`
- **Description**: The main entry point. Orchestrates data fetching and layout composition.
- **Main Elements**: `Layout`, `PromptHeader`, `PromptContent`, Interactive Client Components.
- **Data Fetching**: Calls `PromptService.getPrompt(id)` in the frontmatter.
- **Logic**:
    - Validates `id` (UUID).
    - Checks for 404 (prompt not found).
    - Determines `isOwner` by comparing `session.user.id` with `prompt.author_id`.
    - Passes data to child components.

### `PromptHeader` (Astro)
- **Description**: Displays the static metadata of the prompt.
- **Props**: `title`, `author_username`, `created_at`, `updated_at`, `tags`.
- **Logic**: Formats dates (e.g., "Jan 30, 2026"). Renders tags as links or chips.

### `PromptContent` (Astro)
- **Description**: Displays the main prompt body.
- **Props**: `content`.
- **Logic**: Renders the content. If Markdown/Code is supported, applies syntax highlighting (e.g., via Astro's built-in Shiki integration or a simple `<pre>` block for MVP).

### `VoteControl` (React)
- **Description**: Interactive component for upvoting/downvoting.
- **Props**: `promptId`, `initialScore` (number), `initialUserVote` (-1, 0, 1).
- **Internal State**: `score`, `userVote` (optimistic).
- **Interactions**:
    - Click Upvote: Toggle +1.
    - Click Downvote: Toggle -1.
    - Calls `POST /api/prompts/[id]/vote`.

### `CopyButton` (React)
- **Description**: Button to copy prompt content to clipboard.
- **Props**: `content` (string).
- **Internal State**: `isCopied` (boolean for visual feedback).
- **Interactions**:
    - Click: Write to `navigator.clipboard`. Show checkmark icon/toast temporarily.

### `OwnerActions` (React)
- **Description**: Container for actions available only to the prompt author.
- **Props**: `promptId`.
- **Child Components**:
    - **Edit Link**: Navigates to `/prompts/[id]/edit`.
    - **Delete Button**: Opens a confirmation dialog.
- **Interactions**:
    - Delete Click -> Open Dialog.
    - Confirm Delete -> Call `DELETE /api/prompts/[id]` -> Redirect to `/prompts`.

## 5. Types

### `PromptDetailDTO`
*Defined in `src/types.ts`. Used for the page data.*
- `id`: string (UUID)
- `title`: string
- `description`: string
- `content`: string
- `author_id`: string
- `author_username`: string
- `tags`: string[]
- `created_at`: string (ISO Date)
- `updated_at`: string (ISO Date)
- `vote_score`: number
- `user_vote`: -1 | 0 | 1

### `VoteCommand`
*Payload for vote API.*
- `vote_value`: -1 | 0 | 1

## 6. State Management
- **Page Level**: Stateless (SSR). Data is passed as props.
- **VoteControl**: Uses local React state (`useState`) for `score` and `currentVote` to support optimistic UI updates.
- **Delete Dialog**: Uses local React state (`isOpen`, `isDeleting`) to manage the modal visibility and loading state.
- **Toasts**: Uses a global toast context/store (e.g., `sonner` or `react-hot-toast` if available in `shadcn`) to display success/error messages.

## 7. API Integration

### Server-Side (Data Fetching)
- **Method**: Direct Service Call (`PromptService`).
- **Function**: `getPrompt(id: string, userId?: string): Promise<PromptDetailDTO | null>`
- **Usage**: Called in `[id].astro` frontmatter.

### Client-Side (Interactions)
1.  **Vote**:
    -   **Endpoint**: `POST /api/prompts/[promptId]/vote`
    -   **Body**: `{ "vote_value": 1 }`
    -   **Response**: `{ "new_vote_score": 10 }`
2.  **Delete**:
    -   **Endpoint**: `DELETE /api/prompts/[promptId]`
    -   **Response**: `204 No Content`

## 8. User Interactions
1.  **Viewing**: User lands on page. content is fully visible immediately (SSR).
2.  **Voting**: User clicks "Upvote". Icon fills immediately (Optimistic). Request sent in background. If fail, revert and show error toast.
3.  **Copying**: User clicks "Copy". Button changes to "Copied!" for 2 seconds. Toast appears "Copied to clipboard".
4.  **Deleting**: Owner clicks "Delete". Warning modal appears. User confirms. Button shows spinner. Page redirects to Prompt List upon success.
5.  **Tag Navigation**: User clicks a tag. Redirects to `/prompts?tag={tagName}`.

## 9. Conditions and Validation
-   **ID Validation**: `id` in URL must be a valid UUID. If not, return 404 immediately.
-   **Existence Check**: If `getPrompt(id)` returns null, redirect to 404.
-   **Ownership Check**:
    -   UI: `OwnerActions` only rendered if `session.user.id === prompt.author_id`.
    -   API: `DELETE` endpoint must verify ownership again on the server.
-   **Authentication**:
    -   Vote/Delete actions require the user to be logged in. If not, these buttons should be disabled or prompt login.

## 10. Error Handling
-   **404 Not Found**: If ID invalid or prompt missing, show standard 404 page.
-   **500 Server Error**: If DB fetch fails, show error banner/page.
-   **Network Error (Client)**:
    -   Vote failed: Revert UI, show "Failed to submit vote".
    -   Delete failed: Close modal (or keep open), show "Failed to delete prompt".
-   **Unauthorized**: If session expires while on page, actions should fail gracefully (redirect to login or show error).

## 11. Implementation Steps

1.  **Backend / Service Layer**:
    -   Update `PromptRepository` (if needed) to support fetching a single prompt with joined author username and vote status.
    -   Update `PromptService` to add `getPrompt(id: string, userId?: string): Promise<PromptDetailDTO | null>`.
    -   Create API endpoints:
        -   `src/pages/api/prompts/[id]/index.ts` (Handle DELETE).
        -   `src/pages/api/prompts/[id]/vote.ts` (Handle POST).

2.  **UI Components (React)**:
    -   Create `src/components/prompts/VoteControl.tsx`.
    -   Create `src/components/prompts/CopyButton.tsx`.
    -   Create `src/components/prompts/OwnerActions.tsx` (includes Delete Dialog).

3.  **View Construction (Astro)**:
    -   Create `src/pages/prompts/[id].astro`.
    -   Implement frontmatter: Extract ID, get Session, call `PromptService`.
    -   Implement JSX: Scaffold Layout, Header, Content, and embed React components.
    -   Style with Tailwind.

4.  **Verification**:
    -   Test viewing a valid prompt.
    -   Test viewing an invalid ID (404).
    -   Test Voting (verify DB update).
    -   Test Copy (verify clipboard).
    -   Test Delete (verify DB soft delete).
