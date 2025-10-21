You are an experienced product manager whose task is to create a comprehensive Product Requirements Document (PRD) based on the following descriptions:

<project_description>
# High-Level Overview: Corporate Prompt Library MVP

This document outlines the Minimum Viable Product (MVP) for the "Corporate Prompt Library" project.

## 1. Problem Statement

Engineers face a steep learning curve with AI tools. Crafting effective, context-rich prompts for company-specific codebases is difficult and time-consuming. This slows down the adoption of AI tools and limits the potential return on investment.

## 2. Proposed Solution

A centralized, internal web application that serves as a curated library for high-quality prompts. It will allow engineers to easily find, share, and collaborate on prompts that are tailored to our organization's frameworks, coding patterns, and architectural standards. This turns prompting from an abstract art into a concrete engineering practice using proven, reusable assets.

## 3. Target Users

All software engineers within the organization, from junior to senior levels.

## 4. Core MVP Features

The functional requirements for the MVP, covering the core business logic and data management needs:

- **User Authentication:** A login mechanism to identify users (fulfills the User Access Control requirement).
- **Prompt CRUD:** Users can create, read, update, and delete prompts in the library (fulfills the Data Management requirement).
- **Voting/Rating System:** A basic mechanism for the community to upvote the most effective prompts (part of the Business Logic requirement).
- **Search & Categorization:** A simple search and categorization functionality to easily find prompts (part of the Business Logic requirement).
- **Copy to Clipboard:** A one-click function to copy a prompt to be easily pasted into an AI tool.

</project_description>

<project_details>
<conversation_summary>
  <decisions>
   1. Authentication: An independent, generic authentication system will be used, potentially leveraging an existing library. Corporate
      SSO will not be used for the MVP.
   2. Prompt Management: Users can create, read, update, and delete their own prompts. They cannot modify prompts created by others.
   3. Search: The search functionality will index the prompt's title, description, tags, and the full content of the prompt itself.
   4. Tagging: A flexible tagging system will be implemented. It will allow users to create new tags on the fly but will also feature
      an autocomplete/typeahead function to suggest existing tags as the user types.
   5. Voting: A system for both upvoting and downvoting prompts will be included. For the MVP, there will be no automatic consequences
      for prompts with a low or negative score.
   6. Quality Control: A "Flag for Review" button will be available on prompts. When flagging, the user must provide a reason (e.g.,
      "Inaccurate," "Outdated").
   7. User Roles: There will be no special "Admin" or "Moderator" roles in the MVP. All users will have the same permissions.
   8. Analytics: Basic event logging for key actions (prompt creation, view, copy) will be implemented to query from the database. A
      full dashboard is not required for the MVP. The primary goal of future analytics will be to identify search queries that return
      no results.
   9. User Experience: The MVP will not include enforced prompt creation templates or syntax highlighting to prioritize a leaner build.
  </decisions>

  <matched_recommendations>
   1. Tagging System: "Implement a tag input field with an autocomplete/typeahead feature. It should display existing tags that match
      the user's input but still allow them to create a new one if no suitable match is found. This balances flexibility with
      organization." - This was fully accepted.
   2. Search Scope: "The search should absolutely index the full prompt content. This is critical for allowing users to find prompts
      containing specific code snippets, function names, or keywords that might not be in the description or tags." - This was fully
      accepted.
   3. Analytics Implementation: "For the MVP, instead of a full dashboard, implement simple logging of key events (prompt creation,
      view, copy). The data can be queried directly from the database." - This was fully accepted.
   4. Quality Control Mechanism: "Add a 'Flag for Review' button. When clicked, it should require the user to select a reason (e.g.,
      'Inaccurate,' 'Outdated,' 'Unclear'). This provides structured feedback for content moderation." - This was fully accepted.
   5. Future Analytics Focus: "Focus initial analytics on answering 'What are the most searched-for topics that yield no results?' This
      data is invaluable as it directly shows what content the users need but cannot find, guiding future prompt creation." - This was
      fully accepted.
  </matched_recommendations>

  <prd_planning_summary>
  This document summarizes the product requirements for the Corporate Prompt Library MVP. The product aims to solve the difficulty and
  time engineers spend crafting effective, context-rich prompts for AI tools.

  a. Main Functional Requirements:
   * User Authentication: A standalone login system for users to create and manage their accounts.
   * Prompt CRUD: Users can create, read, update, and delete their own prompts.
   * Search & Discovery: A comprehensive search engine that indexes prompt titles, descriptions, tags, and full content.
   * Tagging: A user-driven tagging system with autocomplete to suggest existing tags and allow the creation of new ones.
   * Voting: A community-driven upvote/downvote mechanism on all prompts.
   * Quality Control: A "Flag for Review" feature for users to report low-quality prompts by providing a specific reason.
   * Core UX: A one-click "Copy to Clipboard" function for all prompts.
   * Analytics: Backend logging of key user events (prompt creation, views, copies) for manual analysis.

  b. Key User Stories and Usage Paths:
   * Finding a Prompt: A junior engineer searches for "react unit test" and finds a highly-rated prompt. They copy it with one click and
     use it in their AI tool.
   * Sharing a Prompt: A senior engineer creates a new, detailed prompt for refactoring legacy code, adding the tags "refactoring" and
     "legacy-code" so others can find it.
   * Maintaining Quality: An engineer finds an outdated prompt, downvotes it, and uses the "Flag for Review" button, selecting
     "Outdated" as the reason.

  c. Important Success Criteria and Measurement:
   * Adoption: Achieve 10 new prompts created within the first week of launch.
   * Engagement: Achieve 100 prompt displays (views) within the first week of launch.
   * Measurement: These metrics will be tracked via the backend event logging system and queried directly from the database.

  </prd_planning_summary>

  <unresolved_issues>
   1. Contradiction in Quality Control: A "Flag for Review" feature has been approved, but a decision was made to have no "Admin" or
      "Moderator" roles. It is unclear who will receive and act upon these flags. This workflow needs to be defined.
   2. Authentication Strategy Risk: The decision to build an independent authentication system over using the company's SSO introduces
      significant development overhead (password resets, security) and user friction, which could negatively impact adoption. This
      strategic choice should be reviewed.
  </unresolved_issues>
  </conversation_summary>
</project_details>

Follow these steps to create a comprehensive and well-organized document:

1. Divide the PRD into the following sections:
   a. Project Overview
   b. User Problem
   c. Functional Requirements
   d. Project Boundaries
   e. User Stories
   f. Success Metrics

2. In each section, provide detailed and relevant information based on the project description and answers to clarifying questions. Make sure to:
   - Use clear and concise language
   - Provide specific details and data as needed
   - Maintain consistency throughout the document
   - Address all points listed in each section

3. When creating user stories and acceptance criteria
   - List ALL necessary user stories, including basic, alternative, and edge case scenarios.
   - Assign a unique requirement identifier (e.g., US-001) to each user story for direct traceability.
   - Include at least one user story specifically for secure access or authentication, if the application requires user identification or access restrictions.
   - Ensure that no potential user interaction is omitted.
   - Ensure that each user story is testable.

Use the following structure for each user story:
- ID
- Title
- Description
- Acceptance Criteria

4. After completing the PRD, review it against this checklist:
   - Is each user story testable?
   - Are the acceptance criteria clear and specific?
   - Do we have enough user stories to build a fully functional application?
   - Have we included authentication and authorization requirements (if applicable)?

5. PRD Formatting:
   - Maintain consistent formatting and numbering.
   - Do not use bold formatting in markdown ( ** ).
   - List ALL user stories.
   - Format the PRD in proper markdown.

Prepare the PRD with the following structure:

```markdown
# Product Requirements Document (PRD) - {{app-name}}
## 1. Product Overview
## 2. User Problem
## 3. Functional Requirements
## 4. Product Boundaries
## 5. User Stories
## 6. Success Metrics
```

Remember to fill each section with detailed, relevant information based on the project description and our clarifying questions. Ensure the PRD is comprehensive, clear, and contains all relevant information needed for further product development.

The final output should consist solely of the PRD in the specified markdown format, which you will save in the file ./DOCS/3_PRD.md