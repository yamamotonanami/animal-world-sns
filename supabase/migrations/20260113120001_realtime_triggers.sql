-- ============================================
-- Migration: Realtime Triggers
-- Purpose: リアクションのリアルタイム更新（broadcast）
-- ============================================

-- Function: Broadcast changes
create or replace function public.broadcast_reaction_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'reactions', -- Topic (global or specific)
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );
  return coalesce(new, old);
end;
$$;

-- Trigger for reactions
create trigger reactions_realtime_trigger
  after insert on public.reactions
  for each row execute function public.broadcast_reaction_changes();

-- Note: We only need INSERT for 'lighting up'. DELETE/UPDATE might be needed if we support un-reacting.
-- Adding DELETE just in case.
create trigger reactions_realtime_trigger_delete
  after delete on public.reactions
  for each row execute function public.broadcast_reaction_changes();

-- Enable Realtime for table
alter publication supabase_realtime add table public.reactions;
