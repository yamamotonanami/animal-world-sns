'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { revalidatePath } from 'next/cache'
import { ensureSupabaseUser } from '@/lib/supabase/auth-helpers'

/**
 * ユーザーのニックネーム、動物タイプ、初期称号を登録する
 */
export async function registerUser(nickname: string, animalTypeName: string, titleName: string) {
  // 1. ClerkユーザーとSupabaseユーザーの同期（存在しなければ作成）
  const user = await ensureSupabaseUser()
  if (!user) throw new Error('Unauthorized')

  // 管理者権限クライアントを作成
  const supabase = createServiceRoleClient()

  // 2. 動物種別の解決（テーブルになければ作成）
  const animalMap: Record<string, string> = {
    dog: 'イヌ', cat: 'ネコ', rabbit: 'うさぎ', beaver: 'ビーバー'
  };
  const displayName = animalMap[animalTypeName] || '動物';
  
  let { data: typeData, error: typeFetchError } = await supabase
    .from('animal_types')
    .select('id')
    .eq('name', displayName)
    .maybeSingle();

  if (!typeData) {
    const { data: newType, error: typeInsertError } = await supabase
      .from('animal_types')
      .insert({ name: displayName, sub_type: animalTypeName })
      .select('id')
      .single();
    
    if (typeInsertError) {
      console.error('Animal type insert error:', typeInsertError);
      throw typeInsertError;
    }
    typeData = newType;
  }
  
  // 3. 称号の解決（テーブルになければ作成）
  let { data: titleData, error: titleFetchError } = await supabase
    .from('titles')
    .select('id')
    .eq('name', titleName)
    .maybeSingle();

  if (!titleData) {
    const { data: newTitle, error: titleInsertError } = await supabase
      .from('titles')
      .insert({ name: titleName, category: 'initial' })
      .select('id')
      .single();
    
    if (titleInsertError) {
      console.error('Title insert error:', titleInsertError);
      throw titleInsertError;
    }
    titleData = newTitle;
  }

  // 4. ユーザー情報の更新
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      nickname, 
      animal_type_id: typeData?.id, 
      current_title_id: titleData?.id 
    })
    .eq('clerk_id', user.clerk_id)

  if (updateError) {
    console.error('User update error:', updateError);
    throw updateError;
  }
  
  // 5. 称号獲得の記録
  if (titleData) {
    const { error: utError } = await supabase
      .from('user_titles')
      .upsert({
        user_id: user.id,
        title_id: titleData.id
      }, { onConflict: 'user_id, title_id' });
    
    if (utError) console.error('User title record error:', utError);
  }

  // キャッシュの更新
  revalidatePath('/')
  revalidatePath('/diagnosis')
  
  return { success: true }
}

/**
 * ユーザーの現在の称号を更新する
 */
export async function updateUserTitle(titleName: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const supabase = createServiceRoleClient()

  // 1. 称号IDの取得
  const { data: titleData } = await supabase
    .from('titles')
    .select('id')
    .eq('name', titleName)
    .single()

  if (!titleData) throw new Error('Title not found')

  // 2. 称号の更新
  const { error } = await supabase
    .from('users')
    .update({ current_title_id: titleData.id })
    .eq('clerk_id', userId)

  if (error) {
    console.error('Update title error:', error)
    throw error
  }

  revalidatePath('/profile')
  return { success: true }
}

/**
 * 現在のユーザープロフィールを取得する
 */
export async function getUserProfile() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createServiceRoleClient()
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      animal_types (name, sub_type),
      titles (name),
      user_titles (title_id)
    `)
    .eq('clerk_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Get profile error:', error);
    return null;
  }

  return user
}
