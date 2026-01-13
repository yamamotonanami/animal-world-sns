'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { revalidatePath } from 'next/cache'

/**
 * 新しい投稿を作成し、カウントを更新して称号をチェックする
 */
export async function createPost(content: string, translatedContent: string, spaceType: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (userError || !user) throw new Error('User not found')

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      original_content: content,
      translated_content: translatedContent,
      space_type: spaceType
    })
    .select()
    .single()

  if (postError) throw postError

  const updateData: any = {
    post_count: (user.post_count || 0) + 1,
  };
  if (spaceType === 'forest') updateData.forest_post_count = (user.forest_post_count || 0) + 1;
  if (spaceType === 'lake') updateData.lake_post_count = (user.lake_post_count || 0) + 1;

  await supabase.from('users').update(updateData).eq('id', user.id);

  // 称号チェックロジック
  const newlyUnlocked: { id: string, name: string }[] = [];
  const checkAndAwardTitle = async (titleCode: string) => {
    // 修正：'code' で検索して ID を特定する
    const { data: title } = await supabase.from('titles').select('*').eq('code', titleCode).maybeSingle();
    if (title) {
      const { data: existing } = await supabase.from('user_titles').select('*').eq('user_id', user.id).eq('title_id', title.id).maybeSingle();
      if (!existing) {
        await supabase.from('user_titles').insert({ user_id: user.id, title_id: title.id });
        newlyUnlocked.push({ id: title.code, name: title.name });
      }
    }
  };

  if (spaceType === 'forest' && (user.forest_post_count || 0) + 1 === 1) await checkAndAwardTitle('first-step');
  if (spaceType === 'lake' && (user.lake_post_count || 0) + 1 === 1) await checkAndAwardTitle('lake-visitor');
  if (spaceType === 'forest' && (user.forest_post_count || 0) + 1 === 10) await checkAndAwardTitle('forest-guardian');

  revalidatePath('/')
  revalidatePath('/profile')
  
  return { post, newlyUnlocked }; // 新しく獲得した称号を返す
}

/**
 * リアクション（しぐさ）を切り替え、称号をチェックする
 */
export async function toggleReaction(postId: string, reactionType: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()

  const { data: user } = await supabase.from('users').select('*').eq('clerk_id', userId).single()
  if (!user) throw new Error('User not found')

  const { data: existing } = await supabase.from('reactions').select('id').eq('post_id', postId).eq('user_id', user.id).eq('type', reactionType).maybeSingle()

  let active = false;
  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
    active = false;
  } else {
    await supabase.from('reactions').insert({ post_id: postId, user_id: user.id, type: reactionType })
    active = true;
  }

  // しぐさカウントの更新と称号チェック
  const newlyUnlocked: { id: string, name: string }[] = [];
  if (active) {
    const countKey = reactionType === 'tail' ? 'reaction_tail_count' : reactionType === 'groom' ? 'reaction_groom_count' : 'reaction_stretch_count';
    const newCount = (user[countKey] || 0) + 1;
    await supabase.from('users').update({ [countKey]: newCount }).eq('id', user.id);

    const checkAndAwardTitle = async (titleName: string) => {
      const { data: title } = await supabase.from('titles').select('*').eq('name', titleName).maybeSingle();
      if (title) {
        const { data: existingUT } = await supabase.from('user_titles').select('*').eq('user_id', user.id).eq('title_id', title.id).maybeSingle();
        if (!existingUT) {
          await supabase.from('user_titles').insert({ user_id: user.id, title_id: title.id });
          newlyUnlocked.push({ id: title.id, name: title.name });
        }
      }
    };

    if (reactionType === 'tail' && newCount === 5) await checkAndAwardTitle('もふもふの体現者');
    if (reactionType === 'groom' && newCount === 5) await checkAndAwardTitle('換毛期の芸術家');
    if (reactionType === 'stretch' && newCount === 5) await checkAndAwardTitle('窓辺の警備隊長');
  }

  revalidatePath('/profile')
  return { active, newlyUnlocked };
}
