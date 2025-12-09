-- migration version: 20251209211616
-- description: Temporarily disable RLS on all tables for development
-- affected tables: profiles, prompts, tags, prompt_tags, votes, flags, analytics_events
-- special considerations: This is a temporary measure for development. RLS should be re-enabled before production.

-- disable row level security for all tables
alter table public.profiles disable row level security;
alter table public.prompts disable row level security;
alter table public.tags disable row level security;
alter table public.prompt_tags disable row level security;
alter table public.votes disable row level security;
alter table public.flags disable row level security;
alter table public.analytics_events disable row level security;

