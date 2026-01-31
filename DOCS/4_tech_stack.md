# Tech Stack Overview

This document outlines the technology stack for the Corporate Prompt Library MVP.

## Overall Architecture

The project uses a modern Jamstack approach. The frontend is built with Astro, a static-site generator that can use components from various libraries like React for interactive elements (known as "islands of interactivity"). The backend is provided by Supabase, a Backend-as-a-Service (BaaS) platform, which handles the database, user authentication, and APIs. The application is server-side rendered (SSR) using Astro's Node.js adapter.

---

## Frontend

### Astro

- **Role**: Primary web framework for building the user interface.
- **Usage**: Astro is used to structure the pages and layouts of the application. It allows for server-side rendering of content, resulting in fast page loads, while also allowing for client-side interactive components where needed.
- **Documentation**: [https://docs.astro.build/](https://docs.astro.build/)

### React

- **Role**: UI library for creating interactive components.
- **Usage**: React is used within Astro to build dynamic and stateful UI elements, such as the prompt creation form, the voting buttons, and the search bar with autocomplete.
- **Documentation**: [https://react.dev/](https://react.dev/)

### Tailwind CSS

- **Role**: CSS framework for styling.
- **Usage**: Tailwind is used for all styling within the application. Its utility-first approach allows for rapid development and consistent design without writing custom CSS.
- **Documentation**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

## Backend & Database

### Node.js

- **Role**: Server-side runtime environment.
- **Usage**: Node.js is used by the Astro SSR adapter to run the application in a standalone server mode, enabling server-side rendering and API route capabilities.
- **Documentation**: [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)

### Supabase

- **Role**: Backend-as-a-Service (BaaS) for database, authentication, and APIs.
- **Usage**: Supabase provides the project's entire backend infrastructure.
  - **Database**: A managed PostgreSQL database to store all data (users, prompts, votes, tags).
  - **Authentication**: Handles user registration and login, fulfilling the standalone authentication requirement.
  - **APIs**: Auto-generated APIs that are used by the frontend to perform CRUD operations (Create, Read, Update, Delete) on the database.
- **Documentation**: [https://supabase.com/docs](https://supabase.com/docs)

---

## Language

### TypeScript

- **Role**: Primary programming language.
- **Usage**: TypeScript is used for all frontend and backend code. It adds static typing to JavaScript, which helps in catching errors early, improving code quality, and making the codebase more maintainable.
- **Documentation**: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

---

## Testing Tools

This project utilizes a variety of tools to ensure code quality, functionality, and reliability across different testing phases.

### Vitest

-   **Role**: Primary test runner for unit and integration tests.
-   **Usage**: Used for testing JavaScript/TypeScript code, including React components (with React Testing Library) and API logic. Provides fast test execution and features like watch mode.
-   **Documentation**: [https://vitest.dev/](https://vitest.dev/)

### React Testing Library

-   **Role**: Utilities for testing React components.
-   **Usage**: Focuses on testing components in a way that resembles how users interact with them, encouraging accessibility best practices.
-   **Documentation**: [https://testing-library.com/docs/react-testing-library/intro/](https://testing-library.com/docs/react-testing-library/intro/)

### Supertest

-   **Role**: A library for testing HTTP servers.
-   **Usage**: Used for making assertions against HTTP requests and responses, particularly for testing API endpoints.

### ESLint

-   **Role**: Pluggable JavaScript linter.
-   **Usage**: Enforces code style, identifies problematic patterns, and ensures adherence to coding standards across TypeScript and Astro files.
-   **Documentation**: [https://eslint.org/](https://eslint.org/)

### TypeScript Compiler (`tsc`)

-   **Role**: Static type checker.
-   **Usage**: Ensures type safety throughout the codebase, catching potential errors at compile time rather than runtime.
-   **Documentation**: [https://www.typescriptlang.org/docs/handbook/command-line-tools.html](https://www.typescriptlang.org/docs/handbook/command-line-tools.html)

