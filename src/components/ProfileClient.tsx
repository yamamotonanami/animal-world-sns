"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Award, Settings, LogOut, RefreshCw, X, PawPrint, Map, Heart, Sparkles, Coffee } from "lucide-react";
import { TITLES } from "@/lib/mock-data";
import { ANIMAL_DATA, AnimalType, AREAS_CONFIG } from "@/lib/constants";
import { UserData } from "@/lib/titles";
import { updateUserTitle } from "@/app/actions/user";
import { fetchUserPosts } from "@/app/actions/post";
import { useClerk } from "@clerk/nextjs";

export default function ProfileClient({ initialUser }: { initialUser: UserData }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [user, setUser] = useState<UserData>(initialUser);
  const [activeTab, setActiveTab] = useState<"titles" | "stats">("titles");
  const [isUpdating, setIsUpdating] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const animalInfo = ANIMAL_DATA[user.animal as AnimalType] || ANIMAL_DATA.dog;

  useEffect(() => {
    if (activeTab === "stats" && userPosts.length === 0) {
      setLoadingPosts(true);
      fetchUserPosts().then(posts => {
        setUserPosts(posts);
      }).finally(() => {
        setLoadingPosts(false);
      });
    }
  }, [activeTab]);

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
    <div className="min-h-screen bg-offwhite pb-24 text-brown">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-white/80 backdrop-blur-md border-b border-white/60 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 text-brown/60 hover:text-brown"><ChevronLeft size={24} /></button>
          <h1 className="text-lg font-black text-brown">プロフィール</h1>
        </div>
        <button 
          onClick={handleSignOut}
          className="p-2 text-brown/40 hover:text-red-400 transition-colors"
          title="ログアウト"
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="pt-24 p-6 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-sage/5 border-2 border-sage/20 flex items-center justify-center shadow-inner overflow-hidden">
            <img 
              src={animalInfo.iconUrl} 
              alt={animalInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-mustard/10 text-mustard text-xs font-bold rounded-full border border-mustard/20">
              <Award size={12} />
              {user.title}
            </div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-sm text-brown/60 font-medium">森の「{animalInfo.name}」さん</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex p-1 bg-sage/5 rounded-2xl">
            <button onClick={() => setActiveTab("titles")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "titles" ? "bg-white text-sage shadow-sm" : "text-brown/40 hover:text-brown/60"}`}>称号</button>
            <button onClick={() => setActiveTab("stats")} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "stats" ? "bg-white text-sage shadow-sm" : "text-brown/40 hover:text-brown/60"}`}>記録</button>
          </div>

          {activeTab === "titles" ? (
            <div className="grid grid-cols-1 gap-3">
              <p className="text-[10px] font-bold text-brown/40 uppercase tracking-widest px-2">初期の称号</p>
              {TITLES.initial.map((titleName) => (
                <button
                  key={titleName}
                  onClick={() => handleTitleSelect(titleName)}
                  disabled={isUpdating}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    user.title === titleName
                      ? "bg-sage/5 border-sage text-sage"
                      : "bg-white border-sage/5 text-brown/60 hover:border-sage/20"
                  }`}
                >
                  <span className="text-sm font-medium">{titleName}</span>
                  {user.title === titleName && <div className="w-2 h-2 rounded-full bg-sage" />}
                </button>
              ))}

              <p className="text-[10px] font-bold text-brown/40 uppercase tracking-widest px-2 mt-4">解放された称号</p>
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
                          : "bg-white border-sage/5 text-brown/60 hover:border-sage/20"
                        : "bg-white/50 border-brown/5 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.name}</span>
                      {!isUnlocked && <span className="text-[10px] text-brown/40">{t.condition}</span>}
                    </div>
                    {isUnlocked ? (
                      user.title === t.name ? <div className="w-2 h-2 rounded-full bg-sage" /> : <Award size={16} className="text-mustard" />
                    ) : (
                      <Award size={16} className="opacity-10 text-brown" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {loadingPosts ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-sage/20 border-t-sage rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-brown/40 font-bold">思い出を読み込んでいます...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="text-4xl opacity-50">🍃</div>
                  <p className="text-xs text-brown/40 font-bold">まだ記録がありません。<br/>何かをつぶやいてみましょう。</p>
                </div>
              ) : (
                userPosts.map(post => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={post.id} 
                    className="bg-white/80 backdrop-blur-sm rounded-[24px] p-5 border border-white/60 shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        post.spaceType === 'town' ? 'bg-[#E7A950]/10 text-[#E7A950] border-[#E7A950]/20' : 
                        post.spaceType === 'forest' ? 'bg-[#9BC385]/10 text-[#9BC385] border-[#9BC385]/20' : 
                        'bg-blue-400/10 text-blue-400 border-blue-400/20'
                      }`}>
                        {post.spaceType === 'town' ? '街' : post.spaceType === 'forest' ? '森' : '湖'}
                      </span>
                      <span className="text-[10px] text-brown/40 font-bold">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-brown font-medium leading-relaxed">{post.content}</p>
                    
                    <div className="bg-brown/5 rounded-xl p-3 border border-brown/5">
                      <p className="text-[10px] text-brown/60 italic leading-relaxed">
                        "{post.originalContent}"
                      </p>
                    </div>
                    
                    <div className="flex gap-4 pt-2 border-t border-brown/5">
                      <div className="flex items-center gap-1.5 text-brown/40 text-xs font-bold">
                        <Heart size={14} className={post.reactionCounts.tail > 0 ? "text-[#E7A950]" : ""} /> 
                        {post.reactionCounts.tail}
                      </div>
                      <div className="flex items-center gap-1.5 text-brown/40 text-xs font-bold">
                        <Sparkles size={14} className={post.reactionCounts.groom > 0 ? "text-[#E7A950]" : ""} /> 
                        {post.reactionCounts.groom}
                      </div>
                      <div className="flex items-center gap-1.5 text-brown/40 text-xs font-bold">
                        <Coffee size={14} className={post.reactionCounts.stretch > 0 ? "text-[#E7A950]" : ""} /> 
                        {post.reactionCounts.stretch}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
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
