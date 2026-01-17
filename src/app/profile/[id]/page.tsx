"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Award } from "lucide-react";
import { MOCK_USERS, MOCK_POSTS } from "@/lib/mock-data";
import { ANIMAL_DATA, AnimalType } from "@/lib/constants";

export default function OtherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [targetUser, setTargetUser] = useState<{ id: string; name: string; animal: string; title: string } | null>(null);

  useEffect(() => {
    // 自分の情報を取得（自分のプロフィールなら /profile へ飛ばす）
    const savedUser = localStorage.getItem("animal_sns_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (id === "u-me") {
        router.replace("/profile");
        return;
      }
    }

    // ターゲットユーザーを探す
    const foundUser = MOCK_USERS.find(u => u.id === id);
    if (foundUser) {
      setTargetUser(foundUser);
    }
  }, [id, router]);

  if (!targetUser) return null;

  const animalInfo = ANIMAL_DATA[targetUser.animal as AnimalType] || ANIMAL_DATA.dog;
  const userPosts = MOCK_POSTS.filter(p => p.userId === id);

  return (
    <div className="min-h-screen bg-offwhite pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-sage/10 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-sage/5 rounded-full transition-colors text-sage"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-zinc-800">{targetUser.name}さんの姿</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* メインプロフィール */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full bg-sage/5 border-2 border-sage/20 flex items-center justify-center shadow-inner overflow-hidden"
          >
            <img 
              src={animalInfo.iconUrl} 
              alt={animalInfo.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-mustard/10 text-mustard text-xs font-bold rounded-full border border-mustard/20">
              <Award size={12} />
              {targetUser.title}
            </div>
            <h2 className="text-2xl font-bold text-zinc-800">{targetUser.name}</h2>
            <p className="text-sm text-zinc-400 font-medium tracking-wide">
              森の「{animalInfo.name}」さん
            </p>
          </div>
        </div>

        {/* 動物の説明カード */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-sage/5">
          <h3 className="text-xs font-bold text-sage uppercase tracking-[0.2em] mb-3">
            動物人格
          </h3>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {animalInfo.description}
          </p>
        </div>

        {/* 投稿一覧（簡易） */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-2">
            最近のしぐさ
          </h3>
          {userPosts.map(post => (
            <div key={post.id} className="bg-white/50 p-4 rounded-2xl border border-sage/5">
              <p className="text-zinc-600 text-sm italic line-clamp-2">
                "{post.translatedContent}"
              </p>
              <p className="text-[10px] text-zinc-300 mt-2">
                {new Date(post.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
          ))}
          {userPosts.length === 0 && (
            <p className="text-center text-zinc-400 text-xs py-8">まだ投稿はありません。</p>
          )}
        </div>
      </div>

      {/* 下部ナビゲーション */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[380px] bg-white/90 backdrop-blur-xl border border-sage/20 shadow-2xl rounded-full px-8 py-3 flex items-center justify-between z-20">
        <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-sage transition-colors">森</button>
        <button onClick={() => router.push("/lake")} className="text-zinc-400 hover:text-sage transition-colors">湖</button>
        <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center text-sage cursor-not-allowed">
          <span className="text-3xl mb-1">+</span>
        </div>
        <button onClick={() => router.push("/notifications")} className="text-zinc-400 hover:text-sage transition-colors">通知</button>
        <button onClick={() => router.push("/profile")} className="text-zinc-400 hover:text-sage transition-colors">自分</button>
      </div>
    </div>
  );
}
