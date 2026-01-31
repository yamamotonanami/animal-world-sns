-- 称号「はじめての足跡」の獲得条件テキストを更新する
UPDATE public.titles
SET unlock_condition = '街のタイムラインで初めて投稿する'
WHERE code = 'first-step';
