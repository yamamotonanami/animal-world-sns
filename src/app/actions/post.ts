'use server'

import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { revalidatePath } from 'next/cache'
import { generateFinalPrompt } from '@/lib/ai/prompts'
import { translateWithAI } from '@/lib/ai/gemini'

/**
 * 投稿前のAI翻訳を実行する
 */
export async function translatePostContent(content: string, areaId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()

  // 1. ユーザーの動物タイプを取得
  const { data: user } = await supabase
    .from('users')
    .select('*, animal_types(sub_type)')
    .eq('clerk_id', userId)
    .single()

  if (!user || !user.animal_types) throw new Error('User animal type not found')

  // 2. プロンプト生成
  const prompt = await generateFinalPrompt(content, user.animal_types.sub_type, areaId)

  // 3. AI翻訳実行
  const translated = await translateWithAI(prompt)

  // 括弧などの記号を除去して返す
  return translated.replace(/[「」『』]/g, "").trim()
}

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

  const townPostCount = (user.post_count || 0) - (user.forest_post_count || 0) - (user.lake_post_count || 0);
  
  if (spaceType === 'town' && townPostCount + 1 === 1) await checkAndAwardTitle('first-step');
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

    // 通知の作成
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single();
    if (post && post.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        sender_id: user.id,
        type: 'reaction',
        reaction_type: reactionType,
        post_id: postId
      });
    }
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

/**
 * 自分の投稿履歴を取得する
 */
export async function fetchUserPosts() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()
  
  // ユーザーID特定
  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single()
  if (!user) return []

  // 投稿取得（リアクション数も集計したいが、簡易的に全件取得してJSでやるか、countを使う）
  // Supabaseでrelation countを取得するのは少し面倒なので、一旦取得してから加工
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      reactions(type)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return posts?.map(post => ({
    id: post.id,
    content: post.translated_content,
    originalContent: post.original_content,
    createdAt: post.created_at,
    spaceType: post.space_type,
    reactionCounts: {
      tail: post.reactions.filter((r: any) => r.type === 'tail').length,
      groom: post.reactions.filter((r: any) => r.type === 'groom').length,
      stretch: post.reactions.filter((r: any) => r.type === 'stretch').length,
    }
  })) || []
}
