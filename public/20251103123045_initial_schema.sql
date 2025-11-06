-- migration version: 20251103131351
-- description: create initial schema for the corporate prompt library.
-- affected tables: profiles, prompts, tags, prompt_tags, votes, flags, analytics_events
-- special considerations: this migration creates the initial schema and enables row level security on all tables.

-- create enum types
create type public.flag_reason as enum (
    '''inaccurate''',
    '''outdated''',
    '''unclear'''
);

create type public.event_type as enum (
    '''prompt_view''',
    '''prompt_copy'''
);

-- create profiles table
create table public.profiles (
    id uuid not null primary key references auth.users(id),
    username text not null unique,
    created_at timestamptz not null default now(),
    deleted_at timestamptz
);

-- enable row level security for profiles
alter table public.profiles enable row level security;

-- policy for select: users can see all non-deleted profiles
create policy "allow all users to see non-deleted profiles"
on public.profiles
for select
using (deleted_at is null);

-- policy for insert: logged-in users can create their own profile
create policy "allow logged-in users to create their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- policy for update: users can only update their own non-deleted profile
create policy "allow users to update their own profile"
on public.profiles
for update
using (auth.uid() = id and deleted_at is null)
with check (auth.uid() = id);

-- policy for delete: users can only "soft-delete" their own profile
create policy "allow users to delete their own profile"
on public.profiles
for delete
using (auth.uid() = id);


-- create prompts table
create table public.prompts (
    id uuid not null primary key default gen_random_uuid(),
    author_id uuid not null references public.profiles(id),
    title text not null check (char_length(title) > 5),
    description text,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

-- enable row level security for prompts
alter table public.prompts enable row level security;

-- policy for select: users can see all non-deleted prompts
create policy "allow all users to see non-deleted prompts"
on public.prompts
for select
using (deleted_at is null);

-- policy for insert: logged-in users can create prompts
create policy "allow logged-in users to create prompts"
on public.prompts
for insert
with check (auth.role() = '''authenticated''');

-- policy for update: users can only update their own non-deleted prompts
create policy "allow users to update their own prompts"
on public.prompts
for update
using (auth.uid() = author_id and deleted_at is null)
with check (auth.uid() = author_id);

-- policy for delete: users can only "soft-delete" their own prompts
create policy "allow users to delete their own prompts"
on public.prompts
for delete
using (auth.uid() = author_id);


-- create tags table
create table public.tags (
    id uuid not null primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now()
);

-- enable row level security for tags
alter table public.tags enable row level security;

-- policy for select: all users can see all tags
create policy "allow all users to see all tags"
on public.tags
for select
using (true);

-- policy for insert: logged-in users can create tags
create policy "allow logged-in users to create tags"
on public.tags
for insert
with check (auth.role() = '''authenticated''');


-- create prompt_tags table
create table public.prompt_tags (
    prompt_id uuid not null references public.prompts(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    primary key (prompt_id, tag_id)
);

-- enable row level security for prompt_tags
alter table public.prompt_tags enable row level security;

-- policy for select: all users can see all prompt_tags
create policy "allow all users to see all prompt_tags"
on public.prompt_tags
for select
using (true);

-- policy for insert: logged-in users can create prompt_tags
create policy "allow logged-in users to create prompt_tags"
on public.prompt_tags
for insert
with check (auth.role() = '''authenticated''');


-- create votes table
create table public.votes (
    id uuid not null primary key default gen_random_uuid(),
    prompt_id uuid not null references public.prompts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    vote_value smallint not null check (vote_value in (-1, 1)),
    created_at timestamptz not null default now(),
    unique (prompt_id, user_id)
);

-- enable row level security for votes
alter table public.votes enable row level security;

-- policy for select: all users can see all votes
create policy "allow all users to see all votes"
on public.votes
for select
using (true);

-- policy for insert: logged-in users can create votes
create policy "allow logged-in users to create votes"
on public.votes
for insert
with check (auth.role() = '''authenticated''');

-- policy for update: users can update their own votes
create policy "allow users to update their own votes"
on public.votes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- create flags table
create table public.flags (
    id uuid not null primary key default gen_random_uuid(),
    prompt_id uuid not null references public.prompts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    reason public.flag_reason not null,
    created_at timestamptz not null default now()
);

-- enable row level security for flags
alter table public.flags enable row level security;

-- policy for select: logged-in users can see all flags
create policy "allow logged-in users to see all flags"
on public.flags
for select
using (auth.role() = '''authenticated''');

-- policy for insert: logged-in users can create flags
create policy "allow logged-in users to create flags"
on public.flags
for insert
with check (auth.role() = '''authenticated''');


-- create analytics_events table
create table public.analytics_events (
    id bigserial primary key,
    prompt_id uuid references public.prompts(id) on delete set null,
    user_id uuid references auth.users(id) on delete set null,
    event_type public.event_type not null,
    created_at timestamptz not null default now()
);

-- enable row level security for analytics_events
alter table public.analytics_events enable row level security;

-- policy for insert: allow all users to insert events
create policy "allow all users to insert events"
on public.analytics_events
for insert
with check (true);


-- create indexes
create index idx_tags_name_case_insensitive on public.tags (lower(name));
create index idx_prompts_author_id on public.prompts (author_id);
create index idx_votes_prompt_id on public.votes (prompt_id);
