# Technical Specification: User Authentication Module

## 1. Introduction
This document outlines the architecture for implementing user registration, login, logout, and password recovery functionalities for the Corporate Prompt Library MVP, leveraging Astro for the frontend, Supabase for backend services (database and authentication), and React for interactive components.

## 2. User Interface Architecture

### 2.1. Pages
*   `/login`: Dedicated page for user login.
*   `/register`: Dedicated page for new user registration.
*   `/forgot-password`: Dedicated page for initiating password recovery.
*   `/update-password`: Page for users to set a new password via a recovery link.
*   Redirects: Behavior for authenticated vs. unauthenticated users accessing protected routes. For example, unauthenticated users attempting to access `/list` or `/prompts/new` will be redirected to `/login`. Authenticated users attempting to access `/login` or `/register` will be redirected to `/list`.

### 2.2. Components
*   `LoginForm.tsx`: React component for user login, accepting email and password.
*   `RegisterForm.tsx`: React component for user registration, accepting display name, email, password, and password confirmation.
*   `ForgotPasswordForm.tsx`: React component for requesting a password reset email, accepting email.
*   `UpdatePasswordForm.tsx`: React component for setting a new password after a recovery link, accepting new password and password confirmation.
*   `AuthLayout.astro`: A new Astro layout specifically for authentication pages (login, register, forgot password, update password) to provide a consistent, minimalist UI for these flows, separate from the main application layout.
*   `Header.astro` (or similar existing component): This component will be extended to conditionally display a "Login" / "Register" link when the user is unauthenticated, and a "Logout" button along with the user's display name when authenticated.

### 2.3. Client-side React Components vs. Astro Pages Responsibilities
*   **Astro Pages**: These will be responsible for server-side rendering the initial HTML of the authentication forms, managing page-specific metadata (titles, descriptions), and embedding the React components as "islands" for interactivity. They will also implement server-side redirects based on the authentication status checked by middleware. For instance, `src/pages/login.astro` will render `LoginForm.tsx`.
*   **React Components**: These will handle all client-side logic:
    *   Managing form state and user input.
    *   Implementing client-side validation (e.g., password complexity, email format, password confirmation matching).
    *   Interacting directly with the Supabase client library to perform authentication actions (`signInWithPassword`, `signUp`, `resetPasswordForEmail`, `updateUser`).
    *   Displaying loading indicators and user-friendly error messages based on Supabase responses.
    *   Triggering client-side redirects post-authentication action.

### 2.4. Validation and Error Handling
*   **Client-side Validation**: Forms will use a client-side validation library (e.g., Zod with React Hook Form) to provide immediate feedback to the user on input errors (e.g., invalid email format, short password, non-matching passwords). This prevents unnecessary requests to the backend.
*   **Server-side Validation (Supabase)**: Supabase Auth performs its own robust validation for email uniqueness, password strength, and token validity. Any custom user profile data (e.g., display name) will also have server-side validation, potentially via RLS policies or Supabase Edge Functions.
*   **Error Messages**: Specific and informative error messages will be displayed to the user for both client-side validation failures and errors returned by Supabase (e.g., "Invalid credentials," "User already exists," "Password reset link expired").

### 2.5. Key Scenarios
*   **Successful Login**: Upon successful authentication, the user's session is established, and they are programmatically redirected to the `/list` page. A success notification might be briefly displayed.
*   **Failed Login**: An error message (e.g., "Invalid email or password") is displayed on the login form, allowing the user to retry.
*   **Successful Registration**: The new user is created, typically automatically logged in, and redirected to the `/list` page. An optional welcome message can be shown.
*   **Password Reset Request**: After submitting their email, the user receives a confirmation message instructing them to check their inbox. The email contains a unique link to reset their password.
*   **Accessing Protected Routes**: If an unauthenticated user attempts to access any route designated as protected (e.g., `/list`, `/prompts/new`), the Astro middleware will detect this and redirect them to the `/login` page.

## 3. Backend Logic

### 3.1. API Endpoints
*   The primary authentication operations (registration, login, logout, password reset, user update) will leverage Supabase Auth's built-in APIs. These are directly accessible via the Supabase client library from the frontend.
*   No custom API routes are required in Astro for these core authentication functions.
*   **User Profile Management**: If the `profiles` table stores additional user data beyond what Supabase Auth manages, custom Astro API routes (`src/pages/api/...`) or Supabase Edge Functions might be considered for managing these profiles (e.g., creating a new profile entry after `signUp`).

### 3.2. Data Models
*   **`auth.users` (Supabase)**: This is Supabase's internal table, automatically managed by Supabase Auth. It stores core user credentials (email, hashed password, `id`, `created_at`, etc.).
*   **`public.profiles` (Custom Table)**: A new table `profiles` will be created in the `public` schema within Supabase. This table will store user-specific information intended for public display or internal application logic, such as:
    *   `id`: UUID, foreign key referencing `auth.users.id`.
    *   `display_name`: Text, non-nullable, unique.
    *   `created_at`: Timestamp.
    *   Other potential fields (e.g., `avatar_url`, `bio`).

### 3.3. Input Data Validation
*   **Supabase Auth**: Enforces validation rules on email format, password complexity (if configured), and uniqueness for `auth.users`.
*   **Database Constraints**: The `public.profiles` table will have database-level constraints (e.g., `NOT NULL` for `display_name`, `UNIQUE` constraint on `display_name`).
*   **Row-Level Security (RLS)**: RLS policies on `public.profiles` will ensure that users can only read their own profile or public profiles, and can only update their own profile.

### 3.4. Exception Handling
*   Errors returned by Supabase Auth API calls will be caught by the React components.
*   These errors will be parsed and transformed into user-friendly messages for display on the UI.
*   For critical server-side errors (e.g., database connection issues, misconfigured Supabase client), appropriate logging will be implemented.

### 3.5. Server-Side Rendering (SSR) Updates (`astro.config.mjs`)
*   The existing `astro.config.mjs` is configured for SSR (`output: "server", adapter: node(...)`). This enables Astro pages to perform server-side checks and renders.
*   **Astro Middleware (`src/middleware/index.ts`)**: This will be the central point for server-side authentication state management:
    *   It will read the Supabase session cookie from the incoming request.
    *   It will use a server-side Supabase client instance to verify the session and fetch the current user's data.
    *   The user object (or null if unauthenticated) will be attached to `Astro.locals.user` (or a similar property), making it available to all Astro pages and components during SSR.
    *   It will implement redirect logic:
        *   If a protected route is accessed by an unauthenticated user, redirect to `/login`.
        *   If an authenticated user accesses `/login` or `/register`, redirect to `/list`.
*   **Layouts**: `src/layouts/Layout.astro` and `AuthLayout.astro` will leverage `Astro.locals.user` to conditionally render UI elements (e.g., navigation links, user menu).

## 4. Authentication System (Supabase Auth with Astro)

### 4.1. Supabase Client Integration
*   `src/db/supabase.client.ts`: This file will be responsible for initializing and exporting the Supabase client for client-side usage in React components. It will be configured with the appropriate Supabase URL and `anon` key from environment variables.
*   **Server-side Supabase Client**: A separate instance of the Supabase client will be created and configured in the Astro middleware or API routes. This instance needs to be aware of the request context (e.g., headers, cookies) to properly manage sessions during SSR.

### 4.2. Registration Flow
1.  User accesses `/register` page and fills out `RegisterForm.tsx` (display name, email, password, password confirmation).
2.  Client-side validation occurs.
3.  On valid submission, `supabase.auth.signUp({ email, password })` is called.
4.  If successful, Supabase creates an entry in `auth.users`.
5.  Immediately after, an `insert` operation is performed on the `public.profiles` table using `supabase.from('profiles').insert({ id: newUser.id, display_name })`. This ensures the user's display name is stored.
6.  The user is typically logged in automatically by Supabase upon successful `signUp` (configurable in Supabase settings for email verification).
7.  The client-side React component triggers a programmatic redirect to the `/list` page.

### 4.3. Login Flow
1.  User accesses `/login` page and fills out `LoginForm.tsx` (email, password).
2.  Client-side validation occurs.
3.  On valid submission, `supabase.auth.signInWithPassword({ email, password })` is called.
4.  Upon successful login, Supabase sets secure session cookies in the browser.
5.  The client-side React component triggers a programmatic redirect to the `/list` page.

### 4.4. Logout Flow
1.  Authenticated user clicks the "Logout" button (e.g., in `Header.astro` or a user menu).
2.  `supabase.auth.signOut()` is called via the client-side Supabase client.
3.  Supabase invalidates the session and clears its session cookies from the browser.
4.  The client-side React component triggers a programmatic redirect to the `/login` page.

### 4.5. Password Recovery Flow
1.  User navigates to `/forgot-password` and submits their email in `ForgotPasswordForm.tsx`.
2.  `supabase.auth.resetPasswordForEmail(email)` is called.
3.  A success message is displayed to the user, instructing them to check their email for a recovery link.
4.  The user receives an email with a unique, time-limited link (e.g., `https://your-app.com/update-password?token=...`).
5.  Clicking this link directs the user to the `/update-password` page. Supabase automatically handles the session establishment based on the token in the URL.
6.  On the `/update-password` page, the `UpdatePasswordForm.tsx` collects the new password and its confirmation.
7.  `supabase.auth.updateUser({ password: newPassword })` is called. This function uses the implicitly established session from the recovery token to update the user's password.
8.  Upon successful password update, the user is redirected to the `/login` page with a message indicating the password has been reset.

### 4.6. Session Management
*   Supabase handles the secure storage and management of session tokens via HTTP-only cookies.
*   **Astro Middleware**: Crucially, the `src/middleware/index.ts` will parse these cookies on each SSR request. It will use the server-side Supabase client to retrieve and validate the session. The resulting `User` object (or `null`) will be injected into `Astro.locals`, making the authentication state available to all Astro components and pages during the server-side render cycle, allowing for dynamic UI rendering based on authentication status.

## 5. Security Considerations

*   **Row-Level Security (RLS)**: Crucial for data protection. RLS policies will be implemented on all sensitive tables (e.g., `prompts`, `profiles`, `votes`) to ensure that users can only perform operations (read, insert, update, delete) on data they own or data that is publicly accessible, based on their `auth.uid()`.
*   **Environment Variables**: All sensitive keys (e.g., Supabase URL, `anon` key, service role key if used for server-side operations) must be stored as environment variables and never committed directly to the codebase. Astro's `import.meta.env` will be used for client-side keys, and Node.js `process.env` for server-side keys.
*   **Password Hashing**: Handled automatically and securely by Supabase Auth.
*   **CORS**: Supabase automatically handles CORS for its endpoints, but careful consideration for any custom Astro API routes is necessary.
*   **Rate Limiting**: Supabase has built-in rate limiting for authentication endpoints, but custom rate limiting might be considered for any custom API routes exposed by Astro.

## 6. Implementation Plan (High-Level)
1.  **Supabase Project Setup**:
    *   Create a new Supabase project or configure the existing one.
    *   Enable Email Authentication in Supabase.
    *   Create the `public.profiles` table with `id` referencing `auth.users.id`, `display_name`, and appropriate RLS policies to restrict access and modifications to the owner.
2.  **Frontend Pages & Layouts**:
    *   Create `src/pages/login.astro`, `src/pages/register.astro`, `src/pages/forgot-password.astro`, `src/pages/update-password.astro`.
    *   Create `src/layouts/AuthLayout.astro` for a distinct authentication UI.
    *   Modify `src/layouts/Layout.astro` to conditionally render authentication-related UI elements in the header/navigation.
3.  **React Components**:
    *   Develop `src/components/auth/LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `UpdatePasswordForm.tsx` (create a new `auth` directory within `components`).
    *   Implement client-side validation using a suitable library.
4.  **Astro Middleware**:
    *   Implement/extend `src/middleware/index.ts` to integrate with the server-side Supabase client, read session cookies, populate `Astro.locals.user`, and enforce protected route redirects.
5.  **Component Integration**:
    *   Embed the new React auth forms into their respective Astro pages using `client:load` or `client:idle` directives.
    *   Update existing components like `Header.astro` to display user status and a logout button based on `Astro.locals.user`.
6.  **Error Handling & User Feedback**:
    *   Ensure all forms display appropriate success, loading, and error messages to the user.
    *   Implement redirects after successful authentication actions.

This detailed specification provides a blueprint for implementing the user authentication module, ensuring consistency with the project's architecture and requirements.
