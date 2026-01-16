-- ============================================
-- Migration: usersテーブルとtitlesテーブルの拡張 (安全版)
-- Purpose: 称号の管理、統計データ、最後に滞在したエリアの保存
-- ============================================

-- usersテーブルへのカラム追加（存在しない場合のみ）
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_area') THEN
    ALTER TABLE public.users ADD COLUMN last_area text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='post_count') THEN
    ALTER TABLE public.users ADD COLUMN post_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='forest_post_count') THEN
    ALTER TABLE public.users ADD COLUMN forest_post_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='lake_post_count') THEN
    ALTER TABLE public.users ADD COLUMN lake_post_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reaction_tail_count') THEN
    ALTER TABLE public.users ADD COLUMN reaction_tail_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reaction_groom_count') THEN
    ALTER TABLE public.users ADD COLUMN reaction_groom_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reaction_stretch_count') THEN
    ALTER TABLE public.users ADD COLUMN reaction_stretch_count int DEFAULT 0;
  END IF;
END $$;

-- titlesテーブルへのカラム追加（存在しない場合のみ）
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='titles' AND column_name='code') THEN
    ALTER TABLE public.titles ADD COLUMN code text;
    CREATE INDEX IF NOT EXISTS idx_titles_code ON public.titles(code);
  END IF;
END $$;

-- コメントの追加（これらは何度実行しても問題ありません）
COMMENT ON COLUMN public.users.last_area IS '最後に滞在したエリアのID';
COMMENT ON COLUMN public.users.post_count IS '累計投稿数';
COMMENT ON COLUMN public.users.forest_post_count IS '森エリアでの累計投稿数';
COMMENT ON COLUMN public.users.lake_post_count IS '湖エリアでの累計投稿数';
COMMENT ON COLUMN public.users.reaction_tail_count IS '「しっぽ」リアクションの累計回数';
COMMENT ON COLUMN public.users.reaction_groom_count IS '「毛づくろい」リアクションの累計回数';
COMMENT ON COLUMN public.users.reaction_stretch_count IS '「のび」リアクションの累計回数';
COMMENT ON COLUMN public.titles.code IS '称号の識別コード（first-step, lake-visitor等）';
