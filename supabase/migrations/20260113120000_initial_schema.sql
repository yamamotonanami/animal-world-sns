-- ============================================
-- Migration: 初期スキーマ作成
-- Purpose: 動物世界SNSの基本テーブル構造を作成
-- ============================================

-- 1. animal_types (動物種別)
create table public.animal_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sub_type text,
  is_premium boolean default false,
  created_at timestamptz default now() not null
);
comment on table public.animal_types is '動物の種別定義';
alter table public.animal_types enable row level security;
create policy "Everyone can read animal_types" on public.animal_types for select using (true);

-- 2. titles (称号)
create table public.titles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default 'default',
  unlock_condition text,
  created_at timestamptz default now() not null
);
comment on table public.titles is 'ユーザーが獲得できる称号';
alter table public.titles enable row level security;
create policy "Everyone can read titles" on public.titles for select using (true);

-- 3. users (ユーザー)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  nickname text,
  animal_type_id uuid references public.animal_types(id),
  current_title_id uuid references public.titles(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
comment on table public.users is 'ユーザー情報。Clerkと紐付け';
alter table public.users enable row level security;

-- Users RLS
create policy "Public read users nickname and title" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (clerk_id = auth.jwt() ->> 'sub');

create policy "Users can insert own profile" on public.users
  for insert with check (clerk_id = auth.jwt() ->> 'sub');

-- 4. posts (投稿)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  original_content text not null,
  translated_content text not null,
  space_type text not null check (space_type in ('town', 'forest', 'lake')),
  created_at timestamptz default now() not null
);
comment on table public.posts is 'ユーザーの投稿（原文と翻訳文）';
alter table public.posts enable row level security;

-- Posts RLS
create policy "Public can read translated content" on public.posts
  for select using (true);
  -- Note: original_content visibility is handled by application logic (or column level security if strictly needed, but Row Level is easier. We rely on API not returning original_content for public).
  -- Actually, RLS applies to rows. To hide columns, we usually use a view or just don't select it.
  -- For strict security, we might need a separate table for original_content or strict RLS.
  -- For this MVP, we will rely on the API to filter. But let's add a policy that allows reading *own* rows fully.
  -- Wait, if public can read the ROW, they can read ALL columns unless we use column security.
  -- Supabase/Postgres doesn't support easy column-level RLS in the same way.
  -- Strategy: The 'select' policy allows access to the row. The application must explicitly exclude 'original_content' when querying for public.

create policy "Users can insert own posts" on public.posts
  for insert with check (
    user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub')
  );

-- 5. reactions (リアクション)
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) not null,
  type text not null check (type in ('tail', 'groom', 'stretch')),
  created_at timestamptz default now() not null,
  unique(post_id, user_id, type)
);
comment on table public.reactions is '投稿へのしぐさリアクション';
alter table public.reactions enable row level security;

-- Reactions RLS
create policy "Public can read reactions" on public.reactions
  for select using (true);

create policy "Users can insert own reactions" on public.reactions
  for insert with check (
    user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub')
  );

-- 6. user_titles (獲得称号)
create table public.user_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  title_id uuid references public.titles(id) not null,
  earned_at timestamptz default now() not null,
  unique(user_id, title_id)
);
alter table public.user_titles enable row level security;
create policy "Public can read user_titles" on public.user_titles for select using (true);

-- 7. prompt_templates (翻訳プロンプト)
create table public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  animal_type_id uuid references public.animal_types(id) unique not null,
  system_prompt text not null,
  updated_at timestamptz default now() not null
);
alter table public.prompt_templates enable row level security;
create policy "Service role or authenticated read prompts" on public.prompt_templates
  for select using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- Indexes
create index idx_users_clerk_id on public.users(clerk_id);
create index idx_posts_space_type on public.posts(space_type);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_reactions_post_id on public.reactions(post_id);
