-- ユーザー生成データを強制削除する
BEGIN;

-- 外部キー制約を一時的に無視して削除するアプローチも可能ですが、
-- 今回は正しい順序でDELETEします。

-- 1. 通知
DELETE FROM public.notifications;

-- 2. リアクション
DELETE FROM public.reactions;

-- 3. ユーザー獲得称号
DELETE FROM public.user_titles;

-- 4. 投稿
DELETE FROM public.posts;

-- 5. ユーザー
DELETE FROM public.users;

COMMIT;
