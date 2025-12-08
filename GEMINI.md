# Project Overview

This is a [10x Astro Starter](https://github.com/przeprogramowani/10x-astro-starter) project, a modern web application built with [Astro](https://astro.build/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/). It's designed to be a starting point for fast, accessible, and AI-friendly websites.

The application is server-side rendered and uses the Astro Node.js adapter to run in a standalone mode.

## Building and Running

The following scripts are available in `package.json`:

- **`npm run dev`**: Starts the development server at `http://localhost:3000`.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Previews the production build.
- **`npm run lint`**: Lints the codebase using ESLint.
- **`npm run lint:fix`**: Fixes linting issues automatically.
- **`npm run format`**: Formats the code using Prettier.

## Development Conventions

- **TypeScript**: The project uses a strict TypeScript configuration.
- **Path Aliases**: A path alias `@/*` is configured to point to the `src` directory.
- **Linting**: The project has a comprehensive ESLint setup that enforces strict and stylistic rules, along with accessibility best practices.
- **Styling**: Tailwind CSS is used for styling.
- **AI Development**: The project is configured with AI development tools to enhance the development experience, providing guidelines for project structure, coding practices, and more. These configurations are in the `.cursor/rules`, `.github/copilot-instructions.md`, and `.windsurfrules` files.

# AI Rules for PROMPTINDUCTOR

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

## CODING_PRACTICES

### Guidelines for SUPPORT_LEVEL

#### SUPPORT_BEGINNER

- When running in agent mode, execute up to 3 actions at a time and ask for approval or course correction afterwards.
- Write code with clear variable names and include explanatory comments for non-obvious logic. Avoid shorthand syntax and complex patterns.
- Provide full implementations rather than partial snippets. Include import statements, required dependencies, and initialization code.
- Add defensive coding patterns and clear error handling. Include validation for user inputs and explicit type checking.
- Suggest simpler solutions first, then offer more optimized versions with explanations of the trade-offs.
- Briefly explain why certain approaches are used and link to relevant documentation or learning resources.
- When suggesting fixes for errors, explain the root cause and how the solution addresses it to build understanding. Ask for confirmation before proceeding.
- Offer introducing basic test cases that demonstrate how the code works and common edge cases to consider.

#### SUPPORT_EXPERT

- Favor elegant, maintainable solutions over verbose code. Assume understanding of language idioms and design patterns.
- Highlight potential performance implications and optimization opportunities in suggested code.
- Frame solutions within broader architectural contexts and suggest design alternatives when appropriate.
- Focus comments on 'why' not 'what' - assume code readability through well-named functions and variables.
- Proactively address edge cases, race conditions, and security considerations without being prompted.
- When debugging, provide targeted diagnostic approaches rather than shotgun solutions.
- Suggest comprehensive testing strategies rather than just example tests, including considerations for mocking, test organization, and coverage.

### Guidelines for DOCUMENTATION

#### DOC_UPDATES

- Update relevant documentation in /docs when modifying features
- Keep README.md in sync with new capabilities
- Maintain changelog entries in CHANGELOG.md

#### JSDOC

- Document all functions, classes, and methods with consistent JSDoc comments
- Use @param, @returns, and @throws tags to document function behavior comprehensively
- Implement @example tags with realistic usage scenarios for {{complex_apis}}
- Use @typedef for documenting complex object structures when not using TypeScript
- Configure documentation generation as part of the build process to keep docs current
- Implement custom templates to match {{project_style_guidelines}}

#### TYPEDOC

- Use JSDoc-style comments with TypeScript-specific annotations for all public APIs
- Configure custom themes to match {{project_branding}} for consistent documentation
- Group related functionality using @module and @category tags for better organization
- Document edge cases and error handling for {{critical_functions}}
- Generate and publish documentation as part of the CI/CD pipeline to keep it current
- Include usage examples for complex interfaces and abstract classes

#### SWAGGER

- Define comprehensive schemas for all request and response objects
- Use semantic versioning in API paths to maintain backward compatibility
- Implement detailed descriptions for endpoints, parameters, and {{domain_specific_concepts}}
- Configure security schemes to document authentication and authorization requirements
- Use tags to group related endpoints by resource or functional area
- Implement examples for all endpoints to facilitate easier integration by consumers

### Guidelines for ARCHITECTURE

#### ADR

- Create ADRs in /docs/adr/{name}.md for:
- 1. Major dependency changes
- 2. Architectural pattern changes
- 3. New integration patterns
- 4. Database schema changes

#### CLEAN_ARCHITECTURE

- Strictly separate code into layers: entities, use cases, interfaces, and frameworks
- Ensure dependencies point inward, with inner layers having no knowledge of outer layers
- Implement domain entities that encapsulate {{business_rules}} without framework dependencies
- Use interfaces (ports) and implementations (adapters) to isolate external dependencies
- Create use cases that orchestrate entity interactions for specific business operations
- Implement mappers to transform data between layers to maintain separation of concerns

#### MONOREPO

- Configure workspace-aware tooling to optimize build and test processes
- Implement clear package boundaries with explicit dependencies between packages
- Use consistent versioning strategy across all packages (independent or lockstep)
- Configure CI/CD to build and test only affected packages for efficiency
- Implement shared configurations for linting, testing, and {{development_tooling}}
- Use code generators to maintain consistency across similar packages or modules

#### DDD

- Define bounded contexts to separate different parts of the domain with clear boundaries
- Implement ubiquitous language within each context to align code with business terminology
- Create rich domain models with behavior, not just data structures, for {{core_domain_entities}}
- Use value objects for concepts with no identity but defined by their attributes
- Implement domain events to communicate between bounded contexts
- Use aggregates to enforce consistency boundaries and transactional integrity
