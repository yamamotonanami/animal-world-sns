"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Sparkles, Coffee, MessageSquare, Map, PawPrint } from "lucide-react";
import { ANIMAL_DATA, AnimalType, AREAS_CONFIG } from "@/lib/constants";

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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [user, setUser] = useState<{ name: string; animal: string; title: string } | null>(null);

  useEffect(() => {
    // 1. 読んだ通知IDとカスタム通知を取得
    const readIds = JSON.parse(localStorage.getItem("animal_sns_read_notification_ids") || "[]");
    const customNotifications = JSON.parse(localStorage.getItem("animal_sns_custom_notifications") || "[]");
    
    // 全ての通知をマージ
    const allNotifications = [...customNotifications, ...MOCK_NOTIFICATIONS];
    
    // 2. 表示する通知の既読状態を更新
    const updatedNotifications = allNotifications.map(n => ({
      ...n,
      isRead: n.isRead || readIds.includes(n.id)
    }));
    setNotifications(updatedNotifications);

    // 3. 画面を開いたらすべて既読にする
    const allIds = allNotifications.map(n => n.id);
    localStorage.setItem("animal_sns_read_notification_ids", JSON.stringify(allIds));
    
    // 全体の通知バッジ用フラグも更新
    localStorage.setItem("animal_sns_notifications_read", "true");

    // UI上の反映を1秒後に行う（ユーザーが「あ、新着が来た」と認識した後に既読にする演出）
    const timer = setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-white/80 backdrop-blur-md border-b border-white/60 px-6 py-4 shadow-sm flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-sage/5 rounded-full transition-colors text-brown/60 hover:text-brown"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-brown">通知</h1>
      </header>

      <div className="pt-24 p-4 space-y-3">
        {notifications.map((notification) => (
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
                className="w-10 h-10 rounded-full bg-sage/5 flex items-center justify-center overflow-hidden shrink-0 hover:bg-sage/10 transition-all cursor-pointer"
              >
                {ANIMAL_DATA[notification.userAnimal as AnimalType] ? (
                  <img 
                    src={ANIMAL_DATA[notification.userAnimal as AnimalType].iconUrl} 
                    alt={notification.userAnimal}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">🐾</span>
                )}
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

        {notifications.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-4xl">🍃</div>
            <p className="text-zinc-400 text-sm">まだ通知はありません。<br />ゆったりと過ごしましょう。</p>
          </div>
        )}
      </div>

      {/* 下部ナビゲーション */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-sage/10 pt-3 pb-8 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 w-full px-2">
            <button onClick={() => router.push("/")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center text-lg">🏠</div>
              <span className="text-[10px] font-bold">ホーム</span>
            </button>

            <button onClick={() => router.push("/areas")} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-sage transition-all">
              <div className="w-6 h-6 flex items-center justify-center">
                <Map size={20} />
              </div>
              <span className="text-[10px] font-bold">エリア</span>
            </button>
            
            <div className="flex flex-col items-center gap-1 text-zinc-400 opacity-40">
              <div className="w-6 h-6 flex items-center justify-center">
                <PawPrint size={20} fill="currentColor" className="-rotate-[45deg]" />
              </div>
              <span className="text-[10px] font-bold">投稿</span>
            </div>

            <button className="flex flex-col items-center gap-1 text-sage">
              <div className="w-6 h-6 flex items-center justify-center text-lg">🔔</div>
              <span className="text-[10px] font-bold">通知</span>
              <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-sage" />
            </button>
            
            <button onClick={() => router.push("/profile")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center text-lg">👤</div>
              <span className="text-[10px] font-bold">自分</span>
            </button>
        </div>
      </nav>
    </div>
  );
}
