import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceRoleClient } from './service-role'

export async function ensureSupabaseUser() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  if (!user) return null

  const supabase = createServiceRoleClient()
  
  // Check if user exists first to avoid unnecessary writes if possible, 
  // but upsert is safer for synchronization.
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: userId,
        // nickname: We don't sync nickname from Clerk automatically, user sets it in app?
        // Or we use a default? For now, leave nickname null or preserve existing.
        // If we want to set a default from Clerk name:
        // nickname: user.firstName || 'Unknown', 
        // But we have 6 char limit and strict format. So we leave it for the Registration flow.
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Supabase user sync error:', error)
    return null
  }
  return data
}
