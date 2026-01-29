<conversation_summary>
<decisions>
The first screen after sign-in will be the Prompt List view; there will be no separate “Home” page.
There will be a dedicated Prompt Details screen backed by GET /prompts/{id}, which logs a “view” analytics event and exposes vote, flag, and copy actions.
There will be no “My Prompts” view in the MVP.
Create Prompt and Edit Prompt will be full-page views mapped directly to POST /prompts and PUT /prompts/{id}, with tag autocomplete using GET /tags.
The main navigation will contain only two elements: a link to the Prompt List and a “Create Prompt” button; the logged-in user’s identity will be shown in the top bar via a simple login string (no separate profile page).
All interactive components will use accessible patterns (e.g., shadcn/ui primitives, proper ARIA roles, keyboard navigation, clear labels for voting and flagging).
Authentication-gated access: only sign-in and sign-up are public; prompt listing, prompt details, and prompt creation/edit/delete are behind authentication, with unauthenticated users redirected to auth flows and clear messages on 401/403. The concrete auth mechanism will be implemented later.
The app will use a predictable data fetching and caching strategy (e.g., React Query–style hooks or a lightweight store) to keep lists and detail views in sync, with optimistic updates for votes and tags and refetching after mutations.
The UI will standardize loading and error handling, including skeletons/spinners, inline validation and error banners for 400/422, confirmation dialogs for destructive actions, debounced search hitting GET /prompts, paginated results using limit/offset, and simple client-side caching of recent queries.
</decisions>
<matched_recommendations>
Prompt List as initial view: Use the GET /prompts endpoint as the core of the initial screen after sign-in, including search, filtering, sorting, and pagination, rather than a separate “Home” concept.
Dedicated Prompt Details page: Implement a standalone details view for each prompt powered by GET /prompts/{id}, surfacing title, description, content, tags, author, vote score, flagging, voting, and copy-to-clipboard, and triggering analytics “view” events on entry.
Full-page Create/Edit forms: Implement full-page “Create Prompt” and “Edit Prompt” screens mapped to POST /prompts and PUT /prompts/{id}, with fields for title, description, content, and tags, plus tag autocomplete sourced from GET /tags.
Minimal navigation structure: Define a simple top-level layout with a persistent header containing only two primary actions: navigation to the Prompt List and a “Create Prompt” button, plus a textual login indicator in the top bar instead of a richer profile section.
Mobile-first responsive layouts: Design list, details, and form screens with mobile-first breakpoints, collapsing search and filters into drawers or accordions on smaller viewports, and using single-column lists and adequately sized tap targets.
Accessibility with shadcn/ui: Leverage shadcn/ui components and best practices (semantic HTML, focus management, ARIA roles, keyboard support) for all interactive elements such as voting controls, flag dialogs, search, tag autocomplete, and confirmation modals.
Auth-gated views and error handling: Restrict prompt listing, details, and creation/editing/deletion to authenticated users, redirecting unauthenticated users from protected views to login/registration and showing clear error feedback for 401/403 responses.
State management and caching: Use a React Query–style library or lightweight global store to manage server state for prompts, tags, votes, and flags, enabling caching of list/detail data, optimistic updates for vote/flag actions, and automatic refetch after mutations.
Standardized loading and error UX: Introduce consistent loading skeletons/spinners, inline field validation and error banners for API failures, confirmation dialogs before destructive operations like delete, and debounced search requests to GET /prompts to balance responsiveness and performance.
Pagination and performance: Implement pagination (or infinite scroll) for the Prompt List using the limit and offset parameters of GET /prompts, combined with simple client-side caching of recent queries to minimize redundant network calls and improve perceived performance.
</matched_recommendations>
<ui_architecture_planning_summary>
Main UI architecture requirements
The MVP UI is centered around authenticated users managing and consuming prompts; all core functionality (listing, viewing, creating, editing, deleting, voting, flagging, copying) is behind authentication, while sign-in and sign-up are the only public views.
The architecture will use Astro with React “islands” for interactive components, Tailwind for styling, and shadcn/ui for accessible, composable UI primitives.
The view hierarchy is intentionally shallow and focused: an initial Prompt List screen after login, a Prompt Details screen, and full-page Create/Edit Prompt forms, plus dedicated auth pages.
API integration is tightly mapped to views and actions: GET /prompts for lists and search, GET /prompts/{id} for details, POST/PUT/DELETE /prompts for CRUD, GET /tags for autocomplete, and prompt sub-resources for voting and flagging.
Key views, screens, and user flows
Authentication flows:
Sign-up page where new users register (details of fields and exact API not yet implemented but planned via Supabase auth).
Sign-in page for existing users; upon successful authentication, users are redirected to the Prompt List.
Any attempt to access protected routes (Prompt List, Details, Create/Edit) when unauthenticated results in redirection to login/registration with clear messaging.
Prompt List screen (first post-login view):
Uses GET /prompts with search, tag, authorId (optionally), sortBy, order, limit, and offset to present a paginated, searchable, and sortable list of prompts.
Includes search input (with debounce), tag filters (aligned with tags resource), and sort controls, all responsive and collapsible on mobile.
Each prompt card shows key metadata (title, description snippet, tags, vote score, author/login, creation or updated date) and links to its Prompt Details page.
Prompt Details screen:
Driven by GET /prompts/{id}, presenting full content plus metadata, current vote score, and possibly user’s current vote state.
On page load, the UI triggers an analytics “view” event via the analytics API (as defined in the PRD/API plan).
Exposes actions: vote (POST /prompts/{id}/vote), flag (POST /prompts/{id}/flag), and copy-to-clipboard for the prompt content, plus Edit/Delete for prompts owned by the current user (where permitted by backend rules).
Create Prompt screen:
Full-screen form for creating prompts mapped to POST /prompts, with client-side validation aligned to API rules (e.g., title length, required content, tags as string array).
Tag input supports autocomplete using GET /tags with search and limit, allowing selection of existing tags and creation of new ones by typing.
Edit Prompt screen:
Similar layout and form as Create, but pre-populated using GET /prompts/{id} and saving via PUT /prompts/{id}, respecting ownership rules enforced by backend.
Only visible and accessible for prompts created by the current authenticated user.
API integration and state management strategy
The UI will use a server state management approach (e.g., React Query) to manage data from /prompts, /prompts/{id}, /tags, and sub-resource endpoints, giving caching, request deduplication, and automatic refetch on mutations.
Prompt List integration:
The list view binds its UI controls (search input, filters, sorting, pagination) to a query key used by the data-fetching layer, which issues GET /prompts with the corresponding parameters.
The query results are cached, so navigating back to the list restores the last state with minimal refetching.
Prompt Details integration:
Each detail view is linked to a data query for GET /prompts/{id}, possibly sharing cache with the list entries to avoid redundant fetches.
Vote and flag actions call POST /prompts/{id}/vote and POST /prompts/{id}/flag; the UI performs optimistic updates to the vote score and then syncs state through refetch or cache updates.
Analytics events for “view” and “copy” are sent to the analytics endpoint, which are one-way fire-and-forget operations from the UI perspective.
Create/Edit integration:
Forms use controlled fields and client-side validation mirroring API requirements, then submit to POST /prompts or PUT /prompts/{id} respectively.
On success, the app updates cached prompt data (list and/or details) or triggers refetches to keep views consistent.
The state management layer will also centralize loading, error, and success states so screens can display skeletons, inline errors, and notifications consistently.
Responsiveness, accessibility, and security considerations
Responsiveness:
All core screens (list, details, create/edit) are designed mobile-first, with layout adjustments at breakpoints: single-column lists on phones, multi-column or denser layouts on larger screens.
Search and filtering UI compress into expandable drawers or accordions on small screens; buttons and touch targets follow recommended minimum sizes.
Accessibility:
Use semantic HTML (e.g., lists, headings, buttons, forms) and ARIA attributes only where necessary, following shadcn/ui and React best practices.
All interactive elements (e.g., “Create Prompt”, voting buttons, flag dialogs, copy buttons) are fully keyboard-accessible with visible focus states and descriptive labels or tooltips.
Dialogs (like delete confirmation, flag reason selection) manage focus correctly and announce their role and content to assistive technologies.
Security and auth at UI level:
The router distinguishes public vs. protected routes; protected views perform auth checks and redirect unauthenticated users to login/registration, preserving intended destinations when possible.
The UI handles 401 and 403 from API calls by refreshing auth state and/or redirecting, while displaying user-friendly messages instead of exposing raw error details.
Sensitive operations such as delete and flagging are confirmed via dialogs to prevent accidental actions, and the UI never exposes more authority than the backend grants (e.g., only showing Edit/Delete for the author).
Unresolved issues or areas requiring further clarification
The exact authentication UX (fields, flow between sign-in and sign-up, password reset, error messaging, and how Supabase auth is wired to the Astro/React UI) still needs to be designed and aligned with backend implementation.
The level of detail and placement for analytics event logging controls and feedback (e.g., whether copy/view events are completely silent, or if any non-intrusive indicators should be shown) has not been specified.
It is not yet fully defined how authorization-driven UI conditions (e.g., when to show Edit/Delete buttons or block flagging/voting per user) will obtain and represent the current user’s identity and ownership in the client.
The exact visual design system (color palette, typography scale, component variants) beyond using Tailwind and shadcn/ui remains to be defined to ensure consistent branding and UX across all screens.
</ui_architecture_planning_summary>
<unresolved_issues>
Details of the sign-in and sign-up flows, including exact form fields, error handling patterns, and how Supabase auth tokens are stored and refreshed in the UI.
Concrete design and placement for analytics event logging triggers, particularly whether they are entirely silent or surfaced in any way to users.
Specific strategy for representing and consuming the current user’s identity on the client (e.g., how to determine ownership for Edit/Delete and personalize displays) beyond showing a login string in the top bar.
Final decisions on pagination style (traditional page numbers vs. infinite scroll) and how that interacts with caching, back-navigation behavior, and search filters.
Visual design guidelines (brand-aligned colors, typography, spacing, component variants) that will sit on top of Tailwind and shadcn/ui to ensure a cohesive look and feel.
</unresolved_issues>
</conversation_summary>