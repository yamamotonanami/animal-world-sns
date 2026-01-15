"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Award, Settings, LogOut, RefreshCw, X, PawPrint, Map } from "lucide-react";
import { TITLES } from "@/lib/mock-data";
import { ANIMAL_DATA, AnimalType, AREAS_CONFIG } from "@/lib/constants";
import { UserData } from "@/lib/titles";
import { updateUserTitle } from "@/app/actions/user";
import { useClerk } from "@clerk/nextjs";

export default function ProfileClient({ initialUser }: { initialUser: UserData }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [user, setUser] = useState<UserData>(initialUser);
  const [activeTab, setActiveTab] = useState<"titles" | "stats">("titles");
  const [isUpdating, setIsUpdating] = useState(false);

  const animalInfo = ANIMAL_DATA[user.animal as AnimalType] || ANIMAL_DATA.dog;

  const handleTitleSelect = async (titleName: string) => {
    if (user.title === titleName || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateUserTitle(titleName);
      setUser({ ...user, title: titleName });
    } catch (e) {
      console.error("Failed to update title", e);
      alert("称号の変更に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm("すみかを出て、入り口に戻りますか？")) {
      await signOut(() => router.push("/"));
    }
  };

  return (
    <div className="min-h-screen bg-offwhite pb-24 text-zinc-800">
      <header className="sticky top-0 z-10 bg-white border-b border-sage/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 text-sage"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-bold">プロフィール</h1>
        </div>
        <button 
          onClick={handleSignOut}
          className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
          title="ログアウト"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-sage/5 border-2 border-sage/20 flex items-center justify-center text-6xl shadow-inner">
            {animalInfo.emoji}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-mustard/10 text-mustard text-xs font-bold rounded-full border border-mustard/20">
              <Award size={12} />
              {user.title}
            </div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-sm text-zinc-400">森の「{animalInfo.name}」さん</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex p-1 bg-sage/5 rounded-2xl">
            <button onClick={() => setActiveTab("titles")} className={`flex-1 py-3 text-sm font-bold rounded-xl ${activeTab === "titles" ? "bg-white text-sage shadow-sm" : "text-zinc-400"}`}>称号</button>
            <button onClick={() => setActiveTab("stats")} className={`flex-1 py-3 text-sm font-bold rounded-xl ${activeTab === "stats" ? "bg-white text-sage shadow-sm" : "text-zinc-400"}`}>記録</button>
          </div>

          {activeTab === "titles" ? (
            <div className="grid grid-cols-1 gap-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">初期の称号</p>
              {TITLES.initial.map((titleName) => (
                <button
                  key={titleName}
                  onClick={() => handleTitleSelect(titleName)}
                  disabled={isUpdating}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    user.title === titleName
                      ? "bg-sage/5 border-sage text-sage"
                      : "bg-white border-sage/5 text-zinc-500 hover:border-sage/20"
                  }`}
                >
                  <span className="text-sm font-medium">{titleName}</span>
                  {user.title === titleName && <div className="w-2 h-2 rounded-full bg-sage" />}
                </button>
              ))}

              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mt-4">解放された称号</p>
              {TITLES.unlocked.map((t) => {
                // 修正：プログラム内のID (t.id) と、DBから送られてきたコードを比較する
                const isUnlocked = user.unlockedTitles?.includes(t.id);
                return (
                  <button 
                    key={t.id}
                    disabled={!isUnlocked || isUpdating}
                    onClick={() => handleTitleSelect(t.name)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      isUnlocked 
                        ? user.title === t.name
                          ? "bg-sage/5 border-sage text-sage"
                          : "bg-white border-sage/5 text-zinc-500 hover:border-sage/20"
                        : "bg-zinc-50 border-zinc-100 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.name}</span>
                      {!isUnlocked && <span className="text-[10px] text-zinc-400">{t.condition}</span>}
                    </div>
                    {isUnlocked ? (
                      user.title === t.name ? <div className="w-2 h-2 rounded-full bg-sage" /> : <Award size={16} className="text-mustard" />
                    ) : (
                      <Award size={16} className="opacity-10" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="総投稿数" value={user.postCount} />
              <StatCard label="森の歩み" value={user.forestPostCount} />
              <StatCard label="湖の思い出" value={user.lakePostCount} />
              <StatCard label="しっぽ" value={user.reactionTailCount} />
              <StatCard label="毛づくろい" value={user.reactionGroomCount} />
              <StatCard label="のび" value={user.reactionStretchCount} />
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-sage/10 pt-3 pb-8 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 w-full px-2">
            <button 
              onClick={() => {
                const path = AREAS_CONFIG[user.lastArea as keyof typeof AREAS_CONFIG]?.path || '/';
                router.push(path);
              }} 
              className="flex flex-col items-center gap-1 text-zinc-400"
            >
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

            <button onClick={() => router.push("/notifications")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center text-lg">🔔</div>
              <span className="text-[10px] font-bold">通知</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 text-sage">
              <div className="w-6 h-6 flex items-center justify-center text-lg">👤</div>
              <span className="text-[10px] font-bold">自分</span>
              <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-sage" />
            </button>
        </div>
      </nav>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col p-4 bg-white rounded-2xl border border-sage/5 shadow-sm">
      <span className="text-xl font-bold text-sage">{value}</span>
      <span className="text-[9px] text-zinc-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}
