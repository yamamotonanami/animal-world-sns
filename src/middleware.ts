import { clerkMiddleware } from '@clerk/nextjs/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js の middleware エントリーポイント。
 * `src/middleware.ts` に配置し、`middleware` をエクスポートします。
 */
export const middleware = clerkMiddleware(async (auth, request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  // 環境変数が未設定の場合はスキップ（ビルド時や初期設定時対策）
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Supabase ユーザーセッションの確認 (Clerkとの同期用)
  await supabase.auth.getUser()

  return supabaseResponse
})

// Next.js 16 の規約に従い、config をエクスポート
export const config = {
  matcher: [
    /*
     * 次のパス以外のすべてのリクエストパスに一致させます。
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (ファビコンファイル)
     * 下記のファイル拡張子（画像など）
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Next.js の期待する default export も用意
export default middleware
