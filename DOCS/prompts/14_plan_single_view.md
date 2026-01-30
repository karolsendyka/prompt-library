As a senior frontend developer, your task is to create a detailed implementation plan for a new view in a web application. This plan should be comprehensive and clear enough for another frontend developer to implement the view correctly and efficiently.

First, review the following information:

1. Product Requirements Document (PRD):
<prd>
@DOCS/3_PRD.md 
</prd>

2. View Description:
<view_description>
### 2.4. Prompt Details View

- **View Name**: Prompt Details
- **View Path**: `/prompts/{id}`
- **Main Purpose**: Display the full content of a single prompt with all metadata and available actions (vote, copy, edit, delete)
- **Key Information to Display**:
  - Prompt title (heading)
  - Full prompt description
  - Full prompt content (in a code block or formatted text area, easily copyable)
  - Tags (as clickable chips that link to filtered Prompt List)
  - Author username (with link to author's profile if profile view exists, or filtered Prompt List by author)
  - Creation date and updated date (if different from creation)
  - Current vote score
  - User's current vote state (if authenticated, showing which way they voted)
  - Action buttons: Vote (upvote/downvote), Copy to Clipboard, Edit (if owner), Delete (if owner)
  - Breadcrumb or back link to Prompt List
- **Key View Components**:
  - Prompt header component (title, metadata)
  - Prompt content display component (formatted, syntax-highlighted if applicable, copyable)
  - Tag list component (clickable chips)
  - Author info component (username, dates)
  - Vote controls component (upvote button, downvote button, score display, current vote indicator)
  - Copy to clipboard button component (with success feedback)
  - Edit button component (conditional, only for owner)
  - Delete button component (conditional, only for owner, opens confirmation dialog)
  - Delete confirmation dialog component
  - Loading skeleton component (during data fetch)
  - Error banner (for 404, 401, 403, 500)
  - Success toast/notification (for copy action, vote action)
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Clear, readable prompt content display. One-click copy functionality with immediate visual feedback. Intuitive voting controls with optimistic updates. Confirmation dialogs for destructive actions (delete). Smooth navigation back to list. Analytics "view" event triggered silently on page load.
  - **Accessibility**: Semantic document structure with proper headings. Prompt content in accessible format (code blocks with proper labels). All buttons with descriptive labels and ARIA attributes. Vote controls with clear labels ("Upvote this prompt", "Downvote this prompt"). Dialogs with proper focus management and ARIA roles. Keyboard navigation support. Screen reader announcements for vote/copy actions.
  - **Security**: Ownership checks before showing Edit/Delete buttons (client-side, but backend enforces). Confirmation dialogs prevent accidental actions. Proper error handling for 401/403 with redirect. Analytics events sent securely. No sensitive data exposed in error messages.
</view_description>

3. User Stories:
<user_stories>
- ID: US-007
- Title: Search for Prompts
- Description: As a user, I want to be able to search for prompts based on keywords.
- Acceptance Criteria:
  - A search bar is available on the main page.
  - Users can enter search terms.
  - The search results include prompts where the search term matches in the title, description, tags, or the full prompt content.
  - Search results are displayed in a clear and organized list.

</user_stories>

4. Endpoint Description:
<endpoint_description>
@8_api-plan.md (22-62) 
</endpoint_description>

5. Endpoint Implementation:
<endpoint_implementation>
@src/pages/api/prompts.ts 
</endpoint_implementation>

6. Type Definitions:
<type_definitions>
@src/types.ts 
</type_definitions>

7. Tech Stack:
<tech_stack>
@DOCS/4_tech_stack.md 
</tech_stack>

Before creating the final implementation plan, conduct analysis and planning inside <implementation_breakdown> tags in your thinking block. This section can be quite long, as it's important to be thorough.

In your implementation breakdown, execute the following steps:
1. For each input section (PRD, User Stories, Endpoint Description, Endpoint Implementation, Type Definitions, Tech Stack):
  - Summarize key points
 - List any requirements or constraints
 - Note any potential challenges or important issues
2. Extract and list key requirements from the PRD
3. List all needed main components, along with a brief description of their purpose, needed types, handled events, and validation conditions
4. Create a high-level component tree diagram
5. Identify required DTOs and custom ViewModel types for each view component. Explain these new types in detail, breaking down their fields and associated types.
6. Identify potential state variables and custom hooks, explaining their purpose and how they'll be used
7. List required API calls and corresponding frontend actions
8. Map each user story to specific implementation details, components, or functions
9. List user interactions and their expected outcomes
10. List conditions required by the API and how to verify them at the component level
11. Identify potential error scenarios and suggest how to handle them
12. List potential challenges related to implementing this view and suggest possible solutions

After conducting the analysis, provide an implementation plan in Markdown format with the following sections:

1. Overview: Brief summary of the view and its purpose.
2. View Routing: Specify the path where the view should be accessible.
3. Component Structure: Outline of main components and their hierarchy.
4. Component Details: For each component, describe:
 - Component description, its purpose and what it consists of
 - Main HTML elements and child components that build the component
 - Handled events
 - Validation conditions (detailed conditions, according to API)
 - Types (DTO and ViewModel) required by the component
 - Props that the component accepts from parent (component interface)
5. Types: Detailed description of types required for view implementation, including exact breakdown of any new types or view models by fields and types.
6. State Management: Detailed description of how state is managed in the view, specifying whether a custom hook is required.
7. API Integration: Explanation of how to integrate with the provided endpoint. Precisely indicate request and response types.
8. User Interactions: Detailed description of user interactions and how to handle them.
9. Conditions and Validation: Describe what conditions are verified by the interface, which components they concern, and how they affect the interface state
10. Error Handling: Description of how to handle potential errors or edge cases.
11. Implementation Steps: Step-by-step guide for implementing the view.

Ensure your plan is consistent with the PRD, user stories, and includes the provided tech stack.

The final output should be in English and saved in a file named .ai/{view-name}-view-implementation-plan.md. Do not include any analysis and planning in the final output.

Here's an example of what the output file should look like (content is to be replaced):

```markdown
# View Implementation Plan [View Name]

## 1. Overview
[Brief description of the view and its purpose]

## 2. View Routing
[Path where the view should be accessible]

## 3. Component Structure
[Outline of main components and their hierarchy]

## 4. Component Details
### [Component Name 1]
- Component description [description]
- Main elements: [description]
- Handled interactions: [list]
- Handled validation: [list, detailed]
- Types: [list]
- Props: [list]

### [Component Name 2]
[...]

## 5. Types
[Detailed description of required types]

## 6. State Management
[Description of state management in the view]

## 7. API Integration
[Explanation of integration with provided endpoint, indication of request and response types]

## 8. User Interactions
[Detailed description of user interactions]

## 9. Conditions and Validation
[Detailed description of conditions and their validation]

## 10. Error Handling
[Description of handling potential errors]

## 11. Implementation Steps
1. [Step 1]
2. [Step 2]
3. [...]
```

Begin analysis and planning now. Your final output should consist solely of the implementation plan in English in markdown format, which you will save in the .ai/{view-name}-view-implementation-plan.md file and should not duplicate or repeat any work done in the implementation breakdown.