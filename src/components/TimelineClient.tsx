"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Coffee, X, Award, Megaphone, PawPrint, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMAL_DATA, AnimalType, AREAS_CONFIG } from "@/lib/constants";
import { UserData } from "@/lib/titles";
import { createPost, toggleReaction, translatePostContent } from "@/app/actions/post";
import { updateLastArea } from "@/app/actions/user";

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
  const [posts, setPosts] = useState(initialPosts);

  // クライアントサイドでのマウントを確認する状態（ハイドレーションエラー対策）
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // 最後に訪れたエリアを保存
    updateLastArea(spaceType);
  }, [spaceType]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState("");
  const [translationError, setTranslationError] = useState("");
  const [newTitles, setNewTitles] = useState<{ id: string, name: string }[]>([]);

  const handleTranslate = async () => {
    if (!inputValue.trim()) return;
    setIsTranslating(true);
    setTranslationError("");
    try {
      const result = await translatePostContent(inputValue, spaceType);
      setTranslatedResult(result);
    } catch (e) {
      console.error("Translation error:", e);
      setTranslationError("翻訳に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsTranslating(false);
    }
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
            title: (Array.isArray(user.titles) ? user.titles[0]?.name : user.titles?.name) || "ふわふわの新参者",
            // 修正：user.animal_typesが配列の場合とオブジェクトの場合の両方に対応しつつ、デフォルト値も設定
            animalType: (Array.isArray(user.animal_types) ? user.animal_types[0]?.sub_type : user.animal_types?.sub_type) || "dog",
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
    <div className="pb-32 min-h-screen relative text-brown">
      {/* 背景レイヤーを absolute から fixed に変更し、枠内に固定 */}
      <div 
        className="fixed inset-0 z-0 w-full max-w-[430px] left-1/2 -translate-x-1/2 pointer-events-none" 
        style={{
          ...backgroundStyle,
          backgroundAttachment: 'scroll', // fixed配置にするためアタッチメントはscrollでOK
        }} 
      />

      {/* オーバーレイ (LPのような少し白っぽいフィルタ) */}
      <div className="fixed inset-0 z-0 w-full max-w-[430px] left-1/2 -translate-x-1/2 pointer-events-none bg-sage/10 mix-blend-overlay" />

      <div className="relative z-10 pt-[80px]">
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 bg-white/80 backdrop-blur-md border-b border-white/60 shadow-sm h-[60px] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src="/logo/title_logo.png" 
              alt="Animal World" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-18 w-auto object-contain drop-shadow-sm" 
            />
          </div>
        </header>

        <div className="flex flex-col gap-4 p-4">
          {/* システムメッセージ（常に最上部） */}
          {posts.filter((p: any) => p.isSystem).map((post: any) => (
            <div key={post.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-sage/20 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-sage"><Megaphone size={16} /></div>
              <p className="text-xs text-sage font-bold leading-relaxed">{post.content}</p>
            </div>
          ))}

          {/* ユーザー投稿 */}
          {posts.filter((p: any) => !p.isSystem).map((post: any) => (
            <div key={post.id} className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white/60 transition-all hover:shadow-md hover:border-sage/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {ANIMAL_DATA[post.animalType as AnimalType] ? (
                    <img 
                      src={ANIMAL_DATA[post.animalType as AnimalType].iconUrl} 
                      alt={post.animalType}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🐾</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full font-bold border border-sage/10">{post.title}</span>
                  </div>
                  <h3 className="font-bold text-brown text-sm">{post.nickname}</h3>
                </div>
              </div>
              <p className="text-brown/90 leading-relaxed mb-3 text-sm font-medium">{post.translatedContent}</p>
              <div className="flex gap-6 items-center border-t border-brown/5 pt-3">
                {["tail", "groom", "stretch"].map((type) => (
                    <button 
                      key={type}
                      onClick={() => handleToggleReaction(post.id, type as any)}
                      className={`flex items-center gap-1.5 transition-all active:scale-110 ${post.reactions[type].active ? "text-mustard font-bold drop-shadow-[0_0_8px_rgba(231,169,80,0.5)]" : "text-brown/40 hover:text-mustard"}`}
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
          ))}
        </div>


        <AnimatePresence>
            {isModalOpen && (
                <>
                  {/* 背景オーバーレイ */}
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={() => setIsModalOpen(false)} 
                    className="fixed inset-0 z-30 flex justify-center"
                  >
                    <div className="w-full max-w-[430px] h-full bg-brown/20 backdrop-blur-sm" />
                  </motion.div>

                  {/* モーダル本体 */}
                  <motion.div 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    exit={{ y: "100%" }} 
                    transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-xl rounded-t-[40px] p-8 pb-12 z-40 shadow-2xl border-t border-white/50"
                  >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-brown">{postingUI.modalTitle}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brown/5 rounded-full"><X className="text-brown/40" size={24} /></button>
                    </div>
                    {!translatedResult ? (
                        <div className="flex flex-col gap-4">
                            <textarea 
                              value={inputValue} 
                              onChange={(e) => setInputValue(e.target.value)} 
                              placeholder={postingUI.inputPlaceholder} 
                              className="w-full h-32 p-4 rounded-2xl bg-white border border-brown/10 focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none text-brown placeholder:text-brown/30 font-medium" 
                            />
                            {translationError && (
                              <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <X size={16} />
                                {translationError}
                              </p>
                            )}
                            <button onClick={handleTranslate} disabled={!inputValue.trim() || isTranslating} className={`h-14 rounded-full font-bold transition-all ${isTranslating ? "bg-brown/10 text-brown/40" : "bg-sage text-white shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-95"}`}>{isTranslating ? postingUI.translatingText : "翻訳する"}</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-sage/5 border border-sage/10 text-center"><p className="text-sage font-bold text-lg italic">{translatedResult}</p></motion.div>
                            <div className="flex gap-3">
                                <button onClick={() => setTranslatedResult("")} className="flex-1 h-14 rounded-full font-bold text-brown/60 bg-white border border-brown/10 hover:bg-brown/5">やり直す</button>
                                <button onClick={handlePostSubmit} className="flex-[2] h-14 rounded-full font-bold text-white bg-sage shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-95">{postingUI.submitButton}</button>
                            </div>
                        </div>
                    )}
                  </motion.div>
                </>
            )}
        </AnimatePresence>

        <AnimatePresence>
          {newTitles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            >
              {/* 背景オーバーレイ */}
              <div className="absolute inset-0 flex justify-center pointer-events-none">
                <div className="w-full max-w-[430px] h-full bg-brown/20 backdrop-blur-md" />
              </div>
              
              <div className="relative bg-white rounded-[40px] p-8 shadow-2xl border border-sage/10 max-w-[320px] w-full text-center space-y-6 z-10">
                <div className="w-20 h-20 bg-mustard/10 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-mustard/20">✨</div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-brown">新しい称号を獲得！</h2>
                  <div className="flex flex-col gap-2">
                    {newTitles.map(t => (
                      <div key={t.id} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-mustard/10 text-mustard font-bold rounded-full border border-mustard/20">
                        <Award size={16} />{t.name}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-brown/60 font-medium">プロフィール画面から変更できるようになりました。</p>
                <button onClick={() => setNewTitles([])} className="w-full h-14 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 active:scale-95 transition-all hover:bg-sage/90">うれしい！</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md border-t border-white/60 pt-3 pb-8 z-50 shadow-[0_-5px_20px_rgba(178,128,94,0.1)]">
        <div className="grid grid-cols-5 w-full px-2">
            <button 
              onClick={() => {
                const lastArea = user?.last_area || 'town';
                const path = AREAS_CONFIG[lastArea as keyof typeof AREAS_CONFIG]?.path || '/';
                router.push(path);
              }} 
              className="flex flex-col items-center gap-1 text-sage font-bold"
            >
              <div className="w-6 h-6 flex items-center justify-center">🏠</div>
              <span className="text-[10px] font-bold">ホーム</span>
              <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-sage mt-1" />
            </button>

            <button onClick={() => router.push("/areas")} className="flex flex-col items-center gap-1 text-brown/40 hover:text-sage transition-all">
              <div className="w-6 h-6 flex items-center justify-center">
                <Map size={20} />
              </div>
              <span className="text-[10px] font-bold">エリア</span>
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex flex-col items-center gap-1 text-brown/40 hover:text-sage transition-all"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <PawPrint size={20} fill="currentColor" className="-rotate-[45deg]" />
              </div>
              <span className="text-[10px] font-bold">投稿</span>
            </button>

            <button onClick={() => router.push("/notifications")} className="flex flex-col items-center gap-1 text-brown/40 hover:text-sage transition-all">
              <div className="w-6 h-6 flex items-center justify-center">🔔</div>
              <span className="text-[10px] font-bold">通知</span>
            </button>
            
            <button onClick={() => router.push("/profile")} className="flex flex-col items-center gap-1 text-brown/40 hover:text-sage transition-all">
              <div className="w-6 h-6 flex items-center justify-center">👤</div>
              <span className="text-[10px] font-bold">自分</span>
            </button>
        </div>
      </nav>
    </div>
  );
}
