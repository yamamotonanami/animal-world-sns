"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Sparkles, Coffee, MessageSquare } from "lucide-react";
import { ANIMAL_DATA, AnimalType } from "@/lib/constants";

// 通知のモックデータ
const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    type: "reaction",
    reactionType: "tail",
    userId: "u1",
    userNickname: "ぽち",
    userAnimal: "dog",
    postContent: "今日は群れの集まりが長かった...",
    createdAt: "2026-01-09T10:00:00Z",
    isRead: false,
  },
  {
    id: "n2",
    type: "reaction",
    reactionType: "groom",
    userId: "u2",
    userNickname: "たま",
    userAnimal: "cat",
    postContent: "窓の外に不思議な羽の友達がいた...",
    createdAt: "2026-01-09T09:30:00Z",
    isRead: false,
  },
  {
    id: "n3",
    type: "reaction",
    reactionType: "stretch",
    userId: "u3",
    userNickname: "みるく",
    userAnimal: "rabbit",
    postContent: "今日は群れの集まりが長かった...",
    createdAt: "2026-01-08T22:00:00Z",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; animal: string; title: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("animal_sns_user");
    if (!savedUser) {
      router.push("/diagnosis");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  if (!user) return null;

  const getReactionIcon = (type: string) => {
    switch (type) {
      case "tail": return <Heart size={14} className="text-red-400" fill="currentColor" />;
      case "groom": return <Sparkles size={14} className="text-yellow-400" />;
      case "stretch": return <Coffee size={14} className="text-blue-400" />;
      default: return null;
    }
  };

  const getReactionName = (type: string) => {
    switch (type) {
      case "tail": return "しっぽ";
      case "groom": return "毛づくろい";
      case "stretch": return "のび";
      default: return "";
    }
  };

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
        <h1 className="text-lg font-bold text-zinc-800">通知</h1>
      </header>

      <div className="p-4 space-y-3">
        {MOCK_NOTIFICATIONS.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-[24px] border transition-all ${
              notification.isRead 
                ? "bg-white/50 border-sage/5 opacity-70" 
                : "bg-white border-sage/10 shadow-sm"
            }`}
          >
            <div className="flex gap-3">
              <button 
                onClick={() => router.push(`/profile/${notification.userId}`)}
                className="w-10 h-10 rounded-full bg-sage/5 flex items-center justify-center text-xl shrink-0 hover:bg-sage/10 transition-all cursor-pointer"
              >
                {ANIMAL_DATA[notification.userAnimal as AnimalType]?.emoji}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span 
                    onClick={() => router.push(`/profile/${notification.userId}`)}
                    className="font-bold text-sm text-zinc-800 cursor-pointer hover:text-sage transition-colors"
                  >
                    {notification.userNickname}さん
                  </span>
                  <span className="text-zinc-400 text-xs">が</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-sage/5 rounded-full border border-sage/10">
                    {getReactionIcon(notification.reactionType)}
                    <span className="text-[10px] font-bold text-sage uppercase">{getReactionName(notification.reactionType)}</span>
                  </div>
                  <span className="text-zinc-400 text-xs">をしました</span>
                </div>
                
                <div className="bg-zinc-50 rounded-xl p-2.5 mt-2 border border-zinc-100">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={12} className="text-zinc-300 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-zinc-500 line-clamp-1 italic">
                      "{notification.postContent}"
                    </p>
                  </div>
                </div>
                
                <p className="text-[10px] text-zinc-300 mt-2">
                  {new Date(notification.createdAt).toLocaleString("ja-JP", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
              )}
            </div>
          </motion.div>
        ))}

        {MOCK_NOTIFICATIONS.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-4xl">🍃</div>
            <p className="text-zinc-400 text-sm">まだ通知はありません。<br />ゆったりと過ごしましょう。</p>
          </div>
        )}
      </div>

      {/* 下部ナビゲーション */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[380px] bg-white/90 backdrop-blur-xl border border-sage/20 shadow-2xl rounded-full px-8 py-3 flex items-center justify-between z-20">
        <button 
          onClick={() => router.push("/")}
          className="text-zinc-400 hover:text-sage transition-colors"
        >
          森
        </button>
        <button 
          onClick={() => router.push("/lake")}
          className="text-zinc-400 hover:text-sage transition-colors"
        >
          湖
        </button>
        <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center text-sage cursor-not-allowed">
          <span className="text-3xl mb-1">+</span>
        </div>
        <button className="text-sage font-bold">通知</button>
        <button 
          onClick={() => router.push("/profile/u-me")}
          className="text-zinc-400 hover:text-sage transition-colors"
        >
          自分
        </button>
      </div>
    </div>
  );
}
