"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Coffee, X, Award, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMAL_DATA, AnimalType } from "@/lib/constants";
import { UserData } from "@/lib/titles";
import { createPost, toggleReaction } from "@/app/actions/post";

interface TimelineClientProps {
  initialPosts: any[];
  user: any;
  systemMessages: string[];
  spaceType: "town" | "forest" | "lake";
  backgroundStyle: React.CSSProperties;
  headerTitle: string;
  headerDesc: string;
  postingUI: {
    modalTitle: string;
    inputPlaceholder: string;
    translatingText: string;
    submitButton: string;
  };
}

export default function TimelineClient({
  initialPosts,
  user,
  systemMessages,
  spaceType,
  backgroundStyle,
  headerTitle,
  headerDesc,
  postingUI
}: TimelineClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(() => {
    const systemMsgs = systemMessages.map(msg => ({
      id: `sys-${Math.random()}`,
      isSystem: true,
      content: msg,
      createdAt: new Date().toISOString(),
    }));
    const combined = [...initialPosts];
    systemMsgs.forEach(msg => {
      const index = Math.floor(Math.random() * (combined.length + 1));
      combined.splice(index, 0, msg as any);
    });
    return combined;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState("");
  const [newTitles, setNewTitles] = useState<{ id: string, name: string }[]>([]);

  const handleTranslate = () => {
    if (!inputValue.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      const animalType = user?.animal_types?.sub_type || "dog";
      const animalName = ANIMAL_DATA[animalType as AnimalType]?.name || "動物";
      const phrases = [`${animalName}らしく佇んでいる。`, `${animalName}の言葉で風に想いを乗せた。`, `小さな${animalName}の心臓が高鳴っている。`];
      setTranslatedResult(`「${phrases[Math.floor(Math.random() * phrases.length)]}」`);
      setIsTranslating(false);
    }, 1500);
  };

  const handlePostSubmit = async () => {
    if (!user) return;
    const cleanedTranslated = translatedResult.replace(/[「」]/g, "");
    try {
        const { post: newPost, newlyUnlocked } = await createPost(inputValue, cleanedTranslated, spaceType);
        
        if (newlyUnlocked && newlyUnlocked.length > 0) {
            setNewTitles(newlyUnlocked);
        }

        const uiPost = {
            ...newPost,
            userId: user.id,
            nickname: user.nickname,
            title: user.titles?.name || "ふわふわの新参者",
            animalType: user.animal_types?.sub_type || "dog",
            translatedContent: cleanedTranslated,
            reactions: { tail: { count: 0, active: false }, groom: { count: 0, active: false }, stretch: { count: 0, active: false } }
        };

        setPosts([uiPost, ...posts]);
        setIsModalOpen(false);
        setInputValue("");
        setTranslatedResult("");
    } catch (e) {
        console.error("Post error", e);
        alert("投稿に失敗しました");
    }
  };

  const handleToggleReaction = async (postId: string, type: "tail" | "groom" | "stretch") => {
      try {
          const { active, newlyUnlocked } = await toggleReaction(postId, type);
          
          if (newlyUnlocked && newlyUnlocked.length > 0) {
              setNewTitles(newlyUnlocked);
          }

          setPosts(posts.map(post => {
              if (post.id === postId) {
                  const currentReaction = post.reactions[type];
                  return {
                      ...post,
                      reactions: {
                          ...post.reactions,
                          [type]: {
                              count: active ? currentReaction.count + 1 : Math.max(0, currentReaction.count - 1),
                              active: active
                          }
                      }
                  };
              }
              return post;
          }));
      } catch (e) {
          console.error("Reaction error", e);
      }
  };

  return (
    <div className="pb-32 min-h-screen relative overflow-hidden text-zinc-800">
      <div className="absolute inset-0 z-0" style={backgroundStyle} />

      <div className="relative z-10">
        <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-sage/10 px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-bold text-sage">{headerTitle}</h1>
                <p className="text-xs text-zinc-400">{headerDesc}</p>
              </div>
            </div>

            {/* エリア切り替えトグル */}
            <div className="bg-sage/5 p-1 rounded-2xl flex items-center gap-1 border border-sage/10 relative">
              <button 
                onClick={() => router.push("/")} 
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative z-10 ${spaceType === "town" ? "text-sage" : "text-zinc-400"}`}
              >
                街
              </button>
              <button 
                onClick={() => router.push("/forest")} 
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative z-10 ${spaceType === "forest" ? "text-sage" : "text-zinc-400"}`}
              >
                森
              </button>
              <button 
                onClick={() => router.push("/lake")} 
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all relative z-10 ${spaceType === "lake" ? "text-sage" : "text-zinc-400"}`}
              >
                湖
              </button>
              
              <motion.div
                layoutId="activeArea"
                className="absolute inset-y-1 bg-white rounded-xl shadow-sm border border-sage/10"
                initial={false}
                animate={{
                  left: spaceType === "town" ? "4px" : spaceType === "forest" ? "calc(33.33% + 2px)" : "calc(66.66% + 1px)",
                  right: spaceType === "town" ? "calc(66.66% + 1px)" : spaceType === "forest" ? "calc(33.33% + 2px)" : "4px",
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-4 p-4">
          {posts.map((post: any) => (
            post.isSystem ? (
              <div key={post.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-sage/20 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-sage"><Megaphone size={16} /></div>
                <p className="text-xs text-sage font-bold leading-relaxed">{post.content}</p>
              </div>
            ) : (
              <div key={post.id} className="bg-white/85 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-sage/5 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-xl">
                    {ANIMAL_DATA[post.animalType as AnimalType]?.emoji || "🐾"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full">{post.title}</span>
                    </div>
                    <h3 className="font-bold text-zinc-800">{post.nickname}</h3>
                  </div>
                </div>
                <p className="text-zinc-700 leading-relaxed mb-6">{post.translatedContent}</p>
                <div className="flex gap-6 items-center border-t border-sage/5 pt-4">
                  {["tail", "groom", "stretch"].map((type) => (
                      <button 
                        key={type}
                        onClick={() => handleToggleReaction(post.id, type as any)}
                        className={`flex items-center gap-1.5 transition-all active:scale-110 ${post.reactions[type].active ? "text-sage font-bold drop-shadow-[0_0_8px_rgba(167,183,151,0.5)]" : "text-zinc-300 hover:text-sage"}`}
                      >
                        {type === "tail" && <Heart size={18} fill={post.reactions[type].active ? "currentColor" : "none"} />}
                        {type === "groom" && <Sparkles size={18} />}
                        {type === "stretch" && <Coffee size={18} />}
                        <span className="text-[10px] font-medium uppercase tracking-wider">
                            {type === "tail" ? "しっぽ" : type === "groom" ? "毛づくろい" : "のび"}
                        </span>
                      </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/80 backdrop-blur-xl border-t border-sage/10 px-10 pt-3 pb-8 flex items-center justify-between z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <button onClick={() => router.push("/")} className="flex flex-col items-center gap-1 text-sage">
              <div className="w-6 h-6 flex items-center justify-center">🏠</div>
              <span className="text-[10px] font-bold">ホーム</span>
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="w-14 h-14 bg-sage rounded-full flex items-center justify-center text-white shadow-lg shadow-sage/40 hover:scale-105 active:scale-95 transition-all -translate-y-6 border-4 border-[#FDFCFB]"
            >
              <span className="text-4xl mb-1">+</span>
            </button>

            <button onClick={() => router.push("/notifications")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center">🔔</div>
              <span className="text-[10px] font-bold">通知</span>
            </button>
            
            <button onClick={() => router.push("/profile")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center">👤</div>
              <span className="text-[10px] font-bold">自分</span>
            </button>
        </nav>

        <AnimatePresence>
            {isModalOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-sage/20 backdrop-blur-sm z-30 flex justify-center" />
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[40px] p-8 pb-12 z-40 shadow-2xl border-t border-sage/10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-zinc-800">{postingUI.modalTitle}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full"><X className="text-zinc-400" size={24} /></button>
                    </div>
                    {!translatedResult ? (
                        <div className="flex flex-col gap-4">
                            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={postingUI.inputPlaceholder} className="w-full h-32 p-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-sage/20 resize-none" />
                            <button onClick={handleTranslate} disabled={!inputValue.trim() || isTranslating} className={`h-14 rounded-full font-bold transition-all ${isTranslating ? "bg-zinc-100 text-zinc-400" : "bg-sage text-white shadow-lg shadow-sage/30"}`}>{isTranslating ? postingUI.translatingText : "翻訳する"}</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-sage/5 border border-sage/10 text-center"><p className="text-sage font-medium text-lg italic">{translatedResult}</p></motion.div>
                            <div className="flex gap-3">
                                <button onClick={() => setTranslatedResult("")} className="flex-1 h-14 rounded-full font-bold text-zinc-400 bg-zinc-50">やり直す</button>
                                <button onClick={handlePostSubmit} className="flex-[2] h-14 rounded-full font-bold text-white bg-sage shadow-lg shadow-sage/30">{postingUI.submitButton}</button>
                            </div>
                        </div>
                    )}
                  </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
          {newTitles.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sage/20 backdrop-blur-md">
              <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-sage/10 max-w-sm w-full text-center space-y-6">
                <div className="w-20 h-20 bg-mustard/10 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-mustard/20">✨</div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-zinc-800">新しい称号を獲得！</h2>
                  <div className="flex flex-col gap-2">
                    {newTitles.map(t => (
                      <div key={t.id} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-mustard/10 text-mustard font-bold rounded-full border border-mustard/20">
                        <Award size={16} />{t.name}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-zinc-400">プロフィール画面から変更できるようになりました。</p>
                <button onClick={() => setNewTitles([])} className="w-full h-14 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 active:scale-95 transition-all">うれしい！</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
