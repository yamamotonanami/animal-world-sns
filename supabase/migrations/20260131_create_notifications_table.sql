-- 通知テーブルの作成
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null, -- 通知を受け取る人（投稿主）
  sender_id uuid references public.users(id) not null, -- 通知を送った人（リアクションした人）
  type text not null check (type in ('reaction')), -- 通知タイプ
  reaction_type text check (reaction_type in ('tail', 'groom', 'stretch')), -- リアクションの種類
  post_id uuid references public.posts(id), -- 対象の投稿
  is_read boolean default false,
  created_at timestamptz default now() not null
);

comment on table public.notifications is 'ユーザーへの通知';

alter table public.notifications enable row level security;

-- ポリシー: 自分の通知のみ参照可能
create policy "Users can read own notifications" on public.notifications
  for select using (
    user_id in (select id from public.users where clerk_id = auth.jwt() ->> 'sub')
  );

-- インデックス
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);
