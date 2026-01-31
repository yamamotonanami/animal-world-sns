"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  
  const [error, setError] = useState("");

  // Googleログイン
  const signUpWithGoogle = async () => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/diagnosis",
      });
    } catch (err: any) {
      console.error("OAuth error", err);
      setError(err.errors?.[0]?.message || "Googleログインに失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-[#9BC385]/10 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景画像 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.9)), url('/backgrounds/town.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] flex flex-col items-center">
        <div className="w-full space-y-8">
          {/* ヘッダー */}
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="self-start flex items-center gap-2 text-[#B2805E] font-bold text-sm hover:opacity-70 transition-all bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
              <ArrowLeft size={18} />
              <span>もどる</span>
            </Link>
            <div className="text-center space-y-2">
              <div className="text-4xl drop-shadow-sm">🎫</div>
              <h1 className="text-2xl font-black text-[#B2805E] tracking-tighter drop-shadow-sm">住人登録</h1>
              <p className="text-[10px] text-[#B2805E]/60 font-bold uppercase tracking-widest">Create Resident Account</p>
            </div>
          </div>

          {/* フォームカード */}
          <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 shadow-xl border border-white/60 w-full">
            {/* CAPTCHA用要素 */}
            <div id="clerk-captcha" />

            <div className="space-y-6">
              {/* Googleログインボタン */}
              <button
                onClick={signUpWithGoogle}
                className="w-full bg-white border-2 border-[#E7A950]/20 hover:bg-[#E7A950]/5 text-[#B2805E] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Googleで登録
              </button>

              {error && (
                <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <div className="text-center">
                <Link href="/sign-in" className="text-xs font-bold text-[#E7A950] hover:text-[#E7A950]/80">
                  すでにアカウントをお持ちの方はこちら
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
