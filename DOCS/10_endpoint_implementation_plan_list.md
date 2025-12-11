# API Endpoint Implementation Plan: GET /prompts

## 1. Endpoint Overview
Retrieve a paginated list of non-deleted prompts with optional search, tag filter, author filter, sorting, and pagination. Returns prompt metadata plus author username, tags, and aggregated vote score.

## 2. Request Details
- HTTP Method: GET
- URL Structure: `/prompts`
- Parameters:
  - Required: none
  - Optional (query): `search` (string), `tag` (string), `authorId` (uuid), `sortBy` (`created_at` | `updated_at` | `vote_score`), `order` (`asc` | `desc`), `limit` (int, default 20, max 100), `offset` (int, default 0)
- Request Body: none

## 3. Response Details
- Types: `PromptListDTO` and `PaginationDTO` from `src/types.ts`; database tables `prompts`, `profiles`, `tags`, `prompt_tags`, `votes` from `src/db/database.types.ts`; a new internal `ListPromptsQuery` type for filters/sorting/pagination.
- Success 200 with JSON:
  - `data`: `PromptListDTO[]` (id, author_id, author_username, title, description, tags[], vote_score, created_at, updated_at)
  - `pagination`: `PaginationDTO` (total, limit, offset)
- Error codes:
  - 400 invalid query params
  - 401 when session required but missing (if we decide auth-gated) or signature invalid
  - 404 not used (listing resource)
  - 500 unexpected Supabase errors

## 4. Data Flow
1) Astro API route `src/pages/api/prompts.ts` (`GET`, `prerender=false`) receives query params.
2) Zod schema validates/coerces query params and applies defaults; rejects invalid sort/order/limit/offset.
3) Acquire Supabase client from `locals.supabase` (per backend rule). Optionally read session for `authorId` validation or personalized data if needed.
4) Call a new `PromptService.listPrompts(query)` that orchestrates repository call and mapping to DTO + pagination.
5) Repository/query layer executes Supabase queries:
   - Base filter: `deleted_at` is null on prompts and profiles.
   - Join `profiles` for `author_username`.
   - Left-join `prompt_tags` -> `tags` to gather tag names (array distinct).
   - Left-join `votes` to compute `vote_score` as SUM of `vote_value`.
   - Apply optional filters: `author_id`, tag name match, full-text/ILIKE search over title/description/content.
   - Sorting based on `sortBy` + `order` (vote_score computed client side or via SQL with aggregate and `order`).
   - Pagination via `limit`/`offset` with `count: 'exact'` for total.
6) Map DB rows to `PromptListDTO` and bundle pagination.
7) Return JSON response with status 200.

## 5. Security Considerations
- Use `locals.supabase` to respect RLS; ensure queries filter out `deleted_at` (soft delete) for prompts and profiles.
- Input validation with Zod to prevent injection/invalid values (limit bounds, enum sort fields, uuid for authorId, max search length).
- If endpoint should be public, allow missing session; otherwise, enforce session check and return 401.
- Prevent excessive pagination abuse: cap `limit` to 100 and sanitize `offset` >= 0.
- Avoid leaking deleted or unauthorized prompts by always filtering `deleted_at IS NULL` and relying on RLS.

## 6. Error Handling
- 400: Zod validation failure (include flattened errors).
- 401: Missing/invalid session if auth required.
- 500: Supabase query errors or unexpected exceptions; log error detail server-side, return generic message.
- Log errors with `console.error` (no dedicated error table noted); include request context (query params) without PII.

## 7. Performance Considerations
- Use `count: 'exact'` to fetch total once; beware of impact—acceptable for MVP.
- Use indexed columns: `tags.name` has CI index; searches on `title/description/content` may need `ILIKE` with `%` (consider `textSearch` later).
- Fetch minimal columns; aggregate tags and votes in a single query to reduce round trips.
- Cap `limit` to avoid large payloads.

## 8. Implementation Steps
1) Add Zod schema in `src/pages/api/prompts.ts` for query params with defaults and bounds (limit<=100, offset>=0, sort enum, order enum, optional uuid for authorId, optional strings for search/tag).
2) Update API route: export `GET` handler, set `prerender=false`, parse/validate query params, and early-return 400 on failure.
3) Extend `PromptService` with `listPrompts(options)` returning `{ data: PromptListDTO[]; pagination: PaginationDTO }`.
4) Add repository/query helper (in `prompt.repository.ts` or new function) that builds the Supabase query with filters, joins (profiles, tags via prompt_tags, votes), aggregates vote_score, and returns rows plus total count.
5) Map repository results to DTOs (flatten tags names array, sum votes, rename `profiles.username` to `author_username`).
6) In API handler, call service, return 200 with data + pagination JSON; set `Content-Type: application/json`.
7) Add robust error handling: catch Supabase errors, log with context, return 500; 401 if session required; ensure 400 path for validation.
8) Add or update tests (if harness exists) for validation, filters, sorting, pagination, and soft-delete exclusion.
