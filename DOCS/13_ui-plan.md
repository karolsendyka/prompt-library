# UI Architecture for Corporate Prompt Library MVP

## 1. UI Structure Overview

The Corporate Prompt Library MVP is a centralized web application for engineers to discover, share, and collaborate on high-quality prompts. The UI architecture follows a shallow, focused hierarchy with authentication-gated access to core functionality.

The application is built using Astro 5 with React 19 islands for interactive components, styled with Tailwind 4, and leverages shadcn/ui for accessible UI primitives. The architecture emphasizes mobile-first responsive design, comprehensive accessibility, and clear separation between public authentication views and protected content views.

The UI structure consists of six primary views: two public authentication views (Sign Up and Sign In) and four protected content views (Prompt List, Prompt Details, Create Prompt, and Edit Prompt). All protected views require authentication, with unauthenticated users redirected to authentication flows. The Prompt List serves as the landing page after successful authentication, providing immediate access to the prompt library.

Navigation is minimal and focused, with a persistent header containing only essential actions: navigation to the Prompt List and a "Create Prompt" button, plus a simple user identity indicator. The architecture prioritizes discoverability, ease of use, and efficient prompt management workflows.

## 2. View List

### 2.1. Sign Up View

- **View Name**: Sign Up
- **View Path**: `/signup` or `/register`
- **Main Purpose**: Allow new users to create an account to access the prompt library
- **Key Information to Display**:
  - Form title: "Create Account" or "Sign Up"
  - Registration form fields (username, email, password, password confirmation)
  - Link to sign-in page for existing users
  - Validation error messages (inline and summary)
  - Success confirmation (after successful registration)
- **Key View Components**:
  - Registration form with controlled inputs
  - Username input field (with validation: unique, >3 characters)
  - Email input field (with validation: unique, valid email format)
  - Password input field (with validation: complexity requirements)
  - Password confirmation input field (with matching validation)
  - Submit button (disabled during submission)
  - Link to sign-in page ("Already have an account? Sign in")
  - Error banner for API errors (400, 422, 409)
  - Loading spinner during submission
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Clear, concise form with inline validation feedback. Password strength indicator. Smooth transition to sign-in flow after successful registration. Clear error messages that guide users to fix issues.
  - **Accessibility**: Semantic form structure with proper labels and ARIA attributes. Error messages associated with form fields using `aria-describedby`. Keyboard navigation support. Focus management on error states. Screen reader announcements for validation errors.
  - **Security**: Password input uses secure input type. No sensitive data exposed in error messages. Client-side validation prevents unnecessary API calls. Rate limiting considerations for registration attempts.

### 2.2. Sign In View

- **View Name**: Sign In
- **View Path**: `/signin` or `/login`
- **Main Purpose**: Allow registered users to authenticate and access the prompt library
- **Key Information to Display**:
  - Form title: "Sign In" or "Log In"
  - Authentication form fields (username/email, password)
  - Link to sign-up page for new users
  - Validation and authentication error messages
  - Optional "Remember me" checkbox (if supported by auth system)
- **Key View Components**:
  - Sign-in form with controlled inputs
  - Username/email input field
  - Password input field
  - Submit button (disabled during submission)
  - Link to sign-up page ("Don't have an account? Sign up")
  - Error banner for authentication failures (401)
  - Loading spinner during submission
  - Optional "Remember me" checkbox
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Simple, focused form. Clear error messages for failed authentication. Smooth redirect to Prompt List after successful authentication. Preserve intended destination for users redirected from protected routes.
  - **Accessibility**: Semantic form structure with proper labels. Error messages associated with form fields. Keyboard navigation support. Focus management on error states. Screen reader announcements for authentication errors.
  - **Security**: Password input uses secure input type. Generic error messages for authentication failures (don't reveal whether username/email exists). Client-side validation. Rate limiting considerations for login attempts. Secure token storage.

### 2.3. Prompt List View

- **View Name**: Prompt List
- **View Path**: `/` or `/prompts`
- **Main Purpose**: Display a searchable, filterable, sortable, and paginated list of all prompts. This is the first screen users see after authentication.
- **Key Information to Display**:
  - Search input with debounced search functionality
  - Filter controls (tag filter, optional author filter)
  - Sort controls (sort by: created_at, updated_at, vote_score; order: asc, desc)
  - Pagination controls (or infinite scroll indicators)
  - List of prompt cards, each showing:
    - Prompt title
    - Description snippet (truncated)
    - Tags (as clickable chips that filter by tag)
    - Vote score
    - Author username
    - Creation or updated date
    - Link/button to view full prompt details
  - Empty state (when no prompts match search/filters)
  - Loading skeletons during data fetch
- **Key View Components**:
  - Search input component (with debounce, clear button, search icon)
  - Tag filter component (multi-select or single-select with autocomplete from GET /tags)
  - Sort dropdown/select (sortBy and order controls)
  - Pagination component (page numbers or "Load More" button, or infinite scroll trigger)
  - Prompt card component (reusable, clickable, responsive)
  - Empty state component (illustration/message when no results)
  - Loading skeleton component (for prompt cards during loading)
  - Error banner (for API errors: 400, 401, 500)
  - Responsive filter drawer/accordion (for mobile, collapsible on small screens)
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Fast, responsive search with debouncing to reduce API calls. Clear visual hierarchy. Easy-to-scan prompt cards. Persistent filter/search state when navigating back from details. Smooth pagination or infinite scroll. Mobile-friendly layout with collapsible filters.
  - **Accessibility**: Semantic list structure (`<ul>`, `<li>`). Search input with proper label and ARIA live region for results count. Filter controls with clear labels. Keyboard navigation support for all interactive elements. Focus management when filters change. Screen reader announcements for search results and pagination.
  - **Security**: All data fetched via authenticated API calls. No sensitive information exposed. Proper error handling for 401/403 with redirect to authentication. Client-side caching respects authentication state.

### 2.4. Prompt Details View

- **View Name**: Prompt Details
- **View Path**: `/prompts/{id}`
- **Main Purpose**: Display the full content of a single prompt with all metadata and available actions (vote, flag, copy, edit, delete)
- **Key Information to Display**:
  - Prompt title (heading)
  - Full prompt description
  - Full prompt content (in a code block or formatted text area, easily copyable)
  - Tags (as clickable chips that link to filtered Prompt List)
  - Author username (with link to author's profile if profile view exists, or filtered Prompt List by author)
  - Creation date and updated date (if different from creation)
  - Current vote score
  - User's current vote state (if authenticated, showing which way they voted)
  - Action buttons: Vote (upvote/downvote), Flag, Copy to Clipboard, Edit (if owner), Delete (if owner)
  - Breadcrumb or back link to Prompt List
- **Key View Components**:
  - Prompt header component (title, metadata)
  - Prompt content display component (formatted, syntax-highlighted if applicable, copyable)
  - Tag list component (clickable chips)
  - Author info component (username, dates)
  - Vote controls component (upvote button, downvote button, score display, current vote indicator)
  - Flag button component (opens flag dialog)
  - Copy to clipboard button component (with success feedback)
  - Edit button component (conditional, only for owner)
  - Delete button component (conditional, only for owner, opens confirmation dialog)
  - Delete confirmation dialog component
  - Flag reason dialog component (with reason selection: Inaccurate, Outdated, Unclear)
  - Loading skeleton component (during data fetch)
  - Error banner (for 404, 401, 403, 500)
  - Success toast/notification (for copy action, vote action, flag action)
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Clear, readable prompt content display. One-click copy functionality with immediate visual feedback. Intuitive voting controls with optimistic updates. Confirmation dialogs for destructive actions (delete, flag). Smooth navigation back to list. Analytics "view" event triggered silently on page load.
  - **Accessibility**: Semantic document structure with proper headings. Prompt content in accessible format (code blocks with proper labels). All buttons with descriptive labels and ARIA attributes. Vote controls with clear labels ("Upvote this prompt", "Downvote this prompt"). Dialogs with proper focus management and ARIA roles. Keyboard navigation support. Screen reader announcements for vote/flag/copy actions.
  - **Security**: Ownership checks before showing Edit/Delete buttons (client-side, but backend enforces). Confirmation dialogs prevent accidental actions. Proper error handling for 401/403 with redirect. Analytics events sent securely. No sensitive data exposed in error messages.

### 2.5. Create Prompt View

- **View Name**: Create Prompt
- **View Path**: `/prompts/create` or `/prompts/new`
- **Main Purpose**: Allow authenticated users to create and share a new prompt with the community
- **Key Information to Display**:
  - Form title: "Create New Prompt"
  - Form fields: title, description (optional), content, tags
  - Field validation messages (inline)
  - Form submission status (loading, success, error)
  - Cancel button (returns to Prompt List)
  - Submit button
- **Key View Components**:
  - Create prompt form component
  - Title input field (with validation: required, min 6 characters, max length)
  - Description textarea field (optional, with character count if applicable)
  - Content textarea field (required, with character count, syntax highlighting if applicable)
  - Tag input component with autocomplete (using GET /tags, allows selecting existing tags or creating new ones)
  - Inline validation error messages (per field)
  - Submit button (disabled during submission, shows loading state)
  - Cancel button (with confirmation if form has unsaved changes)
  - Error banner (for API errors: 400, 401, 422)
  - Success handling (redirect to created prompt's details page or show success message)
  - Loading spinner during submission
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Clear, intuitive form layout. Real-time validation feedback. Tag autocomplete with smooth interaction. Unsaved changes warning on navigation away. Success redirect to newly created prompt. Helpful placeholder text and hints.
  - **Accessibility**: Semantic form structure with proper labels. All inputs associated with labels and error messages using `aria-describedby`. Tag autocomplete with ARIA combobox pattern. Keyboard navigation support. Focus management on validation errors. Screen reader announcements for form submission status.
  - **Security**: Client-side validation mirrors API requirements. Proper error handling for 401/403 with redirect. No sensitive data in error messages. Form submission only from authenticated users.

### 2.6. Edit Prompt View

- **View Name**: Edit Prompt
- **View Path**: `/prompts/{id}/edit`
- **Main Purpose**: Allow authenticated users to edit prompts they have created
- **Key Information to Display**:
  - Form title: "Edit Prompt"
  - Pre-populated form fields: title, description, content, tags
  - Field validation messages (inline)
  - Form submission status (loading, success, error)
  - Cancel button (returns to Prompt Details)
  - Submit button (labeled "Save Changes" or "Update Prompt")
  - Ownership indicator or context (e.g., "Editing your prompt")
- **Key View Components**:
  - Edit prompt form component (same structure as Create, but pre-populated)
  - Title input field (pre-filled, with validation)
  - Description textarea field (pre-filled, optional)
  - Content textarea field (pre-filled, required)
  - Tag input component with autocomplete (pre-filled with existing tags)
  - Inline validation error messages (per field)
  - Submit button (disabled during submission, shows loading state)
  - Cancel button (with confirmation if form has unsaved changes)
  - Error banner (for API errors: 400, 401, 403, 404, 422)
  - Success handling (redirect to updated prompt's details page)
  - Loading skeleton (during initial data fetch)
  - Loading spinner during submission
  - Unauthorized access handling (403 redirect or error message if user tries to edit another's prompt)
- **UX, Accessibility, and Security Considerations**:
  - **UX**: Pre-populated form with existing data. Same intuitive layout as Create view. Real-time validation. Unsaved changes warning. Success redirect to updated prompt. Clear indication that this is an edit operation.
  - **Accessibility**: Same accessibility patterns as Create view. Pre-filled form fields announced to screen readers. Clear indication of edit mode in page title and heading.
  - **Security**: Ownership verification before allowing access (client-side check, but backend enforces 403). Proper error handling for 401/403/404. No access to edit other users' prompts. Form submission only from authenticated owner.

## 3. User Journey Map

### 3.1. New User Registration and First Prompt Discovery

1. **Entry Point**: User navigates to the application (root URL or `/signup`)
2. **Sign Up**: User lands on Sign Up view, fills out registration form (username, email, password, password confirmation)
3. **Registration Success**: Upon successful registration, user is automatically authenticated and redirected to Prompt List view
4. **Initial Discovery**: User sees the Prompt List with all available prompts, can browse, search, filter, and sort
5. **Prompt Exploration**: User clicks on a prompt card to navigate to Prompt Details view
6. **Prompt Interaction**: User views full prompt content, may vote, copy to clipboard, or flag the prompt
7. **Return to List**: User navigates back to Prompt List (filters/search state preserved)
8. **Create First Prompt**: User clicks "Create Prompt" button in header, fills out Create Prompt form, submits
9. **View Created Prompt**: User is redirected to Prompt Details view of their newly created prompt

### 3.2. Returning User Sign-In and Prompt Management

1. **Entry Point**: User navigates to the application
2. **Sign In**: User lands on Sign In view (or is redirected from protected route), enters credentials
3. **Authentication Success**: User is redirected to Prompt List view (or originally intended destination)
4. **Search and Filter**: User uses search and filters to find specific prompts
5. **View Prompt**: User navigates to Prompt Details view of a specific prompt
6. **Vote and Copy**: User votes on prompt and copies content to clipboard
7. **Edit Own Prompt**: User navigates to a prompt they created, clicks Edit button, modifies content in Edit Prompt view, saves changes
8. **Delete Own Prompt**: User navigates to a prompt they created, clicks Delete button, confirms deletion in dialog, prompt is soft-deleted and user is redirected to Prompt List

### 3.3. Error and Edge Case Flows

1. **Unauthenticated Access**: User attempts to access protected route → Redirected to Sign In with message, after sign-in redirected back to intended destination
2. **Authentication Failure**: User enters incorrect credentials → Error message displayed, user can retry or navigate to Sign Up
3. **Registration Validation Error**: User submits invalid registration data → Inline validation errors displayed, user corrects and resubmits
4. **Prompt Not Found**: User navigates to non-existent prompt ID → 404 error displayed with link back to Prompt List
5. **Unauthorized Edit/Delete**: User attempts to edit/delete another user's prompt → 403 error displayed or Edit/Delete buttons not shown
6. **Network Error**: API request fails → Error banner displayed with retry option or graceful degradation
7. **Empty Search Results**: User's search/filter returns no results → Empty state displayed with suggestions to clear filters
8. **Vote Conflict**: User attempts to vote when already voted → Optimistic update handles state, backend resolves conflict

## 4. Layout and Navigation Structure

### 4.1. Global Layout Structure

The application uses a consistent layout structure across all views:

- **Header/Navigation Bar**: Persistent across all authenticated views, contains:
  - Application logo/brand name (links to Prompt List)
  - "Create Prompt" button (primary action, prominent)
  - User identity indicator (simple text showing username, no dropdown or profile link in MVP)
  - Sign out button (if supported by auth system)
- **Main Content Area**: View-specific content, responsive container
- **Footer** (optional): Minimal footer with basic information if needed

### 4.2. Navigation Patterns

- **Public Views (Sign Up, Sign In)**: 
  - No persistent header navigation
  - Simple links between Sign Up and Sign In pages
  - Redirect to Prompt List after successful authentication

- **Protected Views (Prompt List, Prompt Details, Create, Edit)**:
  - Persistent header with navigation
  - Breadcrumb or back button on Details and Edit views
  - Direct navigation via URL routing
  - State preservation when navigating between List and Details

### 4.3. Navigation Flow Diagram

```
Sign Up ←→ Sign In
    ↓ (success)
Prompt List (landing page)
    ↓ (click prompt)
Prompt Details
    ↓ (click edit, if owner)
Edit Prompt → (save) → Prompt Details
    ↓ (click delete, if owner)
[Confirmation Dialog] → (confirm) → Prompt List

Prompt List
    ↓ (click "Create Prompt")
Create Prompt → (submit) → Prompt Details (new prompt)

Prompt Details
    ↓ (click tag)
Prompt List (filtered by tag)

Prompt Details
    ↓ (click author)
Prompt List (filtered by author, if supported)
```

### 4.4. Mobile Navigation Considerations

- Header navigation collapses on small screens (hamburger menu if needed, though minimal navigation may not require it)
- Filter controls in Prompt List collapse into drawer or accordion on mobile
- Full-screen forms on mobile for Create/Edit views
- Touch-friendly button sizes (minimum 44x44px)
- Bottom navigation bar (optional) for quick access to main actions on mobile

## 5. Key Components

### 5.1. Authentication Components

- **AuthForm**: Base form component for Sign Up and Sign In, handles common form patterns, validation, and submission states
- **PasswordInput**: Secure password input with visibility toggle, strength indicator (for registration)
- **AuthErrorBanner**: Reusable error banner for authentication-related errors

### 5.2. Prompt Display Components

- **PromptCard**: Reusable card component for displaying prompt summaries in lists, includes title, description snippet, tags, vote score, author, and click handler
- **PromptContent**: Component for displaying full prompt content with proper formatting, syntax highlighting (if applicable), and copy functionality
- **TagChip**: Individual tag display component, clickable, used in lists and details
- **TagList**: Container component for displaying multiple tags as chips

### 5.3. Interaction Components

- **VoteControls**: Upvote/downvote buttons with score display, handles optimistic updates, shows current user's vote state
- **CopyButton**: One-click copy to clipboard button with success feedback (toast or icon change)
- **FlagButton**: Button that opens flag reason dialog, handles flag submission
- **FlagDialog**: Dialog component for selecting flag reason (Inaccurate, Outdated, Unclear) and submitting flag

### 5.4. Form Components

- **PromptForm**: Base form component for Create and Edit views, handles common form logic, validation, and submission
- **TagInput**: Autocomplete input component for tags, integrates with GET /tags endpoint, allows selection and creation of new tags
- **FormField**: Reusable form field wrapper with label, input, validation error message, and ARIA attributes
- **ValidationMessage**: Inline validation error message component

### 5.5. Navigation and Layout Components

- **Header**: Persistent header component with logo, Create Prompt button, user indicator, and sign out
- **Breadcrumb**: Navigation breadcrumb component for Details and Edit views
- **BackButton**: Simple back button component for returning to previous view

### 5.6. Feedback Components

- **LoadingSkeleton**: Skeleton loader component for prompt cards and details during data fetch
- **LoadingSpinner**: Spinner component for button and form submission states
- **ErrorBanner**: Reusable error banner for API errors, with retry option if applicable
- **SuccessToast**: Toast notification component for success feedback (copy, vote, etc.)
- **EmptyState**: Empty state component for no search results or empty lists
- **ConfirmationDialog**: Reusable confirmation dialog for destructive actions (delete, unsaved changes)

### 5.7. Search and Filter Components

- **SearchInput**: Debounced search input with clear button and search icon
- **TagFilter**: Tag filter component with autocomplete, integrates with GET /tags
- **SortControls**: Dropdown/select components for sortBy and order selection
- **Pagination**: Pagination component (page numbers or "Load More" button) or infinite scroll trigger
- **FilterDrawer**: Collapsible drawer component for mobile filter controls

### 5.8. Utility Components

- **ProtectedRoute**: Route wrapper component that checks authentication and redirects if unauthenticated
- **ErrorBoundary**: React error boundary for graceful error handling
- **AnalyticsTrigger**: Component or hook for triggering analytics events (view, copy) silently

All components follow shadcn/ui patterns for accessibility, use Tailwind for styling, and are designed to be responsive and mobile-first. Components are composable and reusable across views to maintain consistency and reduce duplication.

