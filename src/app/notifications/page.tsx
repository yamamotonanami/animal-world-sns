"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, Sparkles, Coffee, MessageSquare, Map, PawPrint } from "lucide-react";
import { ANIMAL_DATA, AnimalType, AREAS_CONFIG } from "@/lib/constants";
import { fetchNotifications } from "@/app/actions/user";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [user, setUser] = useState<{ name: string; animal: string; title: string } | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      // 1. DBから通知を取得
      const dbNotifications = await fetchNotifications();
      
      // 2. 既読IDを取得（ローカル）
      const readIds = JSON.parse(localStorage.getItem("animal_sns_read_notification_ids") || "[]");
      
      // 3. 表示する通知の既読状態を更新
      const updatedNotifications = dbNotifications.map((n: any) => ({
        ...n,
        isRead: n.isRead || readIds.includes(n.id)
      }));
      setNotifications(updatedNotifications);

      // 4. 画面を開いたらすべて既読にする
      if (updatedNotifications.length > 0) {
        const allIds = updatedNotifications.map((n: any) => n.id);
        localStorage.setItem("animal_sns_read_notification_ids", JSON.stringify(allIds));
        
        // 全体の通知バッジ用フラグも更新
        localStorage.setItem("animal_sns_notifications_read", "true");

        // UI上の反映を1秒後に行う
        setTimeout(() => {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }, 1000);
      }
    };

    loadNotifications();
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
      case "tail": return <Heart size={14} className="text-[#E7A950]" fill="currentColor" />;
      case "groom": return <Sparkles size={14} className="text-[#E7A950]" />;
      case "stretch": return <Coffee size={14} className="text-[#E7A950]" />;
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
                ? "bg-white/50 border-white/40 opacity-70" 
                : "bg-white/80 border-white/60 shadow-sm"
            }`}
          >
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-sage/5 flex items-center justify-center shrink-0 border border-sage/10 text-xl">
                🐾
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-bold text-sm text-brown">誰か</span>
                  <span className="text-brown/60 text-xs">があなたの投稿に</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-sage/5 rounded-full border border-sage/10">
                    {getReactionIcon(notification.reactionType)}
                    <span className="text-[10px] font-bold text-sage uppercase">{getReactionName(notification.reactionType)}</span>
                  </div>
                  <span className="text-brown/60 text-xs">をしました</span>
                </div>
                
                <div className="bg-brown/5 rounded-xl p-2.5 mt-2 border border-brown/5">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={12} className="text-brown/40 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-brown/60 line-clamp-1 italic">
                      "{notification.postContent}"
                    </p>
                  </div>
                </div>
                
                <p className="text-[10px] text-brown/30 mt-2 font-medium">
                  {new Date(notification.createdAt).toLocaleString("ja-JP", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-[#E7A950] rounded-full mt-2 shrink-0 animate-pulse" />
              )}
            </div>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-4xl opacity-50">🍃</div>
            <p className="text-brown/40 text-sm font-bold">まだ通知はありません。<br />ゆったりと過ごしましょう。</p>
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
