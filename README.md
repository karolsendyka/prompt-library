# Corporate Prompt Library

A centralized, internal web application that serves as a curated library for high-quality prompts. It allows engineers to easily find, share, and collaborate on prompts that are tailored to the organization's frameworks, coding patterns, and architectural standards.

## Project Description

Engineers face a steep learning curve with AI tools. Crafting effective, context-rich prompts for company-specific codebases is difficult and time-consuming. This project aims to solve that problem by turning prompting from an abstract art into a concrete engineering practice using proven, reusable assets.

## Tech Stack

-   **Language**: TypeScript
-   **Frontend**:
    -   [Astro](https://docs.astro.build/): Primary web framework for UI structure and server-side rendering.
    -   [React](https://react.dev/): UI library for interactive components ("islands of interactivity").
    -   [Tailwind CSS](https://tailwindcss.com/docs): Utility-first CSS framework for styling.
-   **Backend & Database**:
    -   [Node.js](https://nodejs.org/en/docs/): Server-side runtime for the Astro SSR adapter.
    -   [Supabase](https://supabase.com/docs): Backend-as-a-Service (BaaS) providing:
        -   A managed PostgreSQL database.
        -   User authentication.
        -   Auto-generated APIs for CRUD operations.

## Getting Started Locally

### Prerequisites

-   Node.js version `22.14.0` (as specified in the `.nvmrc` file).
-   A Supabase account for the database and authentication.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    gh repo clone karolsendyka/prompt-library
    cd prompt-library
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    You will need to populate this file with your Supabase Project URL and Anon Key.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:4321`.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Previews the production build locally.
-   `npm run lint`: Lints the codebase using ESLint.
-   `npm run lint:fix`: Automatically fixes linting issues.
-   `npm run format`: Formats the code using Prettier.

## Project Scope

### MVP Features

-   **User Authentication**: Standalone login system for users to create and manage their accounts.
-   **Prompt CRUD**: Users can create, read, update, and delete their own prompts.
-   **Search & Discovery**: A comprehensive search engine for prompt titles, descriptions, tags, and content.
-   **Tagging**: User-driven tagging system with autocomplete.
-   **Voting**: Community-driven upvote/downvote mechanism.
-   **Quality Control**: A "Flag for Review" feature for users to report low-quality prompts.
-   **Core UX**: A one-click "Copy to Clipboard" function for all prompts.
-   **Analytics**: Backend logging of key user events (prompt creation, views, copies).

### Out of Scope for MVP

-   Corporate SSO integration.
-   Ability for users to modify prompts created by others.
-   Automated actions based on low voting scores.
-   Admin or Moderator roles.
-   A full analytics dashboard.

## Project Status

This project is currently in the **MVP (Minimum Viable Product)** development phase.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.