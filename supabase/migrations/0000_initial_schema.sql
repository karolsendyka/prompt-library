-- Enable the citext extension for case-insensitive text.
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA extensions;

-- 1. Profiles Table
-- Stores public user data. Linked to Supabase auth.users.
-- As requested, username is not unique.
-- Note: Application logic is responsible for creating a profile on new user sign-up.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tags Table
-- Stores unique, case-insensitive tags.
CREATE TABLE public.tags (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name extensions.citext UNIQUE NOT NULL
);

-- 3. Prompts Table
-- Stores the core prompt data.
-- Note: Application logic is responsible for calculating and updating the score column.
CREATE TABLE public.prompts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Full-text search vector
  fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description || ' ' || content)) STORED
);

-- Index for full-text search
CREATE INDEX prompts_fts_idx ON public.prompts USING GIN(fts);

-- 4. Prompt_Tags Join Table
-- Manages the many-to-many relationship between prompts and tags.
CREATE TABLE public.prompt_tags (
  prompt_id BIGINT NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

-- 5. Votes Table
-- Tracks user votes on prompts.
CREATE TABLE public.votes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  prompt_id BIGINT NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_value SMALLINT NOT NULL CHECK (vote_value IN (1, -1)),
  UNIQUE (prompt_id, user_id)
);

-- 6. Prompt Flags Table
-- Stores flags/reports from users about prompts.
CREATE TYPE public.flag_reason AS ENUM ('Inaccurate', 'Outdated', 'Unclear');

CREATE TABLE public.prompt_flags (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  prompt_id BIGINT NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason public.flag_reason NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Analytics Events Table
-- Logs key events for metrics.
CREATE TYPE public.analytics_event_type AS ENUM ('PROMPT_CREATED', 'PROMPT_VIEWED', 'PROMPT_COPIED');

CREATE TABLE public.analytics_events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  prompt_id BIGINT NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Nullable for anonymous views
  event_type public.analytics_event_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 8. Row-Level Security (RLS) Policies

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Prompts
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all prompts" ON public.prompts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create prompts" ON public.prompts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own prompts" ON public.prompts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prompts" ON public.prompts FOR DELETE USING (auth.uid() = user_id);

-- Tags & Prompt_Tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all tags and prompt_tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Users can view all tags and prompt_tags" ON public.prompt_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON public.tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can link tags" ON public.prompt_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can cast votes" ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change or delete their own vote" ON public.votes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change or delete their own vote" ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- Prompt Flags
ALTER TABLE public.prompt_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all flags" ON public.prompt_flags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can flag prompts" ON public.prompt_flags FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics Events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analytics events are public" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.analytics_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
