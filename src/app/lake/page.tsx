"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOCK_POSTS } from "@/lib/mock-data";
import { Heart, Sparkles, Coffee, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMAL_DATA, AnimalType } from "@/lib/constants";
import { getNewUnlockedTitles, UserData } from "@/lib/titles";
import { Award } from "lucide-react";

export default function LakePage() {
  const router = useRouter();
  // 湖の投稿のみを初期表示
  const [posts, setPosts] = useState(MOCK_POSTS.filter(p => p.spaceType === "lake"));
  const [user, setUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedResult, setTranslatedResult] = useState("");
  const [newTitles, setNewTitles] = useState<{ id: string, name: string }[]>([]);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("animal_sns_user");
    if (!savedUser) {
      router.push("/diagnosis");
    } else {
      const parsed = JSON.parse(savedUser);
      // データ形式の移行（migration）
      if (!parsed.unlockedTitles) parsed.unlockedTitles = [parsed.title];
      if (parsed.postCount === undefined) parsed.postCount = 0;
      if (parsed.forestPostCount === undefined) parsed.forestPostCount = 0;
      if (parsed.lakePostCount === undefined) parsed.lakePostCount = 0;
      if (parsed.reactionTailCount === undefined) parsed.reactionTailCount = 0;
      if (parsed.reactionGroomCount === undefined) parsed.reactionGroomCount = 0;
      if (parsed.reactionStretchCount === undefined) parsed.reactionStretchCount = 0;
      setUser(parsed);
    }

    // 通知の既読チェック
    const isRead = localStorage.getItem("animal_sns_notifications_read");
    if (isRead === "true") {
      setHasUnread(false);
    }
  }, [router]);

  const handleTranslate = () => {
    if (!inputValue.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      const animalName = ANIMAL_DATA[user?.animal as AnimalType]?.name || "動物";
      const lakePhrases = [
        `${animalName}は、静かな湖面に映る自分をじっと見つめている。`,
        `ひんやりとした湖の水が、${animalName}の足を優しく包み込んだ。`,
        `遠くの方で魚が跳ねた。${animalName}は少し驚いて、耳を動かした。`,
        `穏やかな波紋が広がっていく。${animalName}の心も、少しずつ凪いでいく。`
      ];
      const randomPhrase = lakePhrases[Math.floor(Math.random() * lakePhrases.length)];
      setTranslatedResult(`「${randomPhrase}」`);
      setIsTranslating(false);
    }, 1500);
  };

  const handlePost = () => {
    if (!user) return;

    // 称号の解放チェック
    const unlocked = getNewUnlockedTitles(user, "lake");
    if (unlocked.length > 0) {
      setNewTitles(unlocked);
    }

    const updatedUser: UserData = {
      ...user,
      postCount: (user.postCount || 0) + 1,
      lakePostCount: (user.lakePostCount || 0) + 1,
      unlockedTitles: [...(user.unlockedTitles || []), ...unlocked.map(t => t.id)],
    };

    const cleanedTranslated = translatedResult.replace(/[「」]/g, "");

    // 投稿後にランダムなリアクション通知を予約
    setTimeout(() => {
      const reactions = ["tail", "groom", "stretch"];
      const animals = [
        { name: "ぽち", animal: "dog", id: "u1" },
        { name: "たま", animal: "cat", id: "u2" },
        { name: "みるく", animal: "rabbit", id: "u3" },
        { name: "ごん", animal: "beaver", id: "u4" }
      ];
      
      const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
      
      const newNotification = {
        id: `n-${Date.now()}`,
        type: "reaction",
        reactionType: randomReaction,
        userId: randomAnimal.id,
        userNickname: randomAnimal.name,
        userAnimal: randomAnimal.animal,
        postContent: cleanedTranslated.substring(0, 20) + (cleanedTranslated.length > 20 ? "..." : ""),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      const storedNotifications = JSON.parse(localStorage.getItem("animal_sns_custom_notifications") || "[]");
      localStorage.setItem("animal_sns_custom_notifications", JSON.stringify([newNotification, ...storedNotifications]));
      
      localStorage.setItem("animal_sns_notifications_read", "false");
      setHasUnread(true);
    }, 5000 + Math.random() * 5000); // 5〜10秒後に届く

    const newPost = {
      id: Date.now().toString(),
      userId: "u-me",
      nickname: user.name,
      title: user.title,
      animalType: user.animal,
      translatedContent: cleanedTranslated,
      originalContent: inputValue,
      spaceType: "lake",
      createdAt: new Date().toISOString(),
      reactions: { 
        tail: { count: 0, active: false }, 
        groom: { count: 0, active: false }, 
        stretch: { count: 0, active: false } 
      },
    };

    setPosts([newPost, ...posts]);
    setUser(updatedUser);
    localStorage.setItem("animal_sns_user", JSON.stringify(updatedUser));
    setIsModalOpen(false);
    setInputValue("");
    setTranslatedResult("");
  };

  const toggleReaction = (postId: string, type: "tail" | "groom" | "stretch") => {
    if (!user) return;

    let updatedUser = { ...user };
    const countKey = type === "tail" ? "reactionTailCount" : type === "groom" ? "reactionGroomCount" : "reactionStretchCount";
    
    // カウントアップと称号チェック
    const unlocked = getNewUnlockedTitles(user, "lake", true, type);
    if (unlocked.length > 0) {
      setNewTitles(unlocked);
    }
    
    updatedUser = {
      ...updatedUser,
      [countKey]: (user[countKey as keyof UserData] as number || 0) + 1,
      unlockedTitles: [...(user.unlockedTitles || []), ...unlocked.map(t => t.id)],
    };
    
    setUser(updatedUser);
    localStorage.setItem("animal_sns_user", JSON.stringify(updatedUser));

    // 自分の投稿へのリアクションなら通知を追加
    const post = posts.find(p => p.id === postId);
    if (post && post.userId === "u-me") {
      const currentReaction = post.reactions[type as keyof typeof post.reactions];
      const newActive = !currentReaction.active;

      if (newActive) {
        const newNotification = {
          id: `n-me-${Date.now()}`,
          type: "reaction",
          reactionType: type,
          userId: "u-me",
          userNickname: user.name,
          userAnimal: user.animal,
          postContent: post.translatedContent.substring(0, 20) + (post.translatedContent.length > 20 ? "..." : ""),
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        const storedNotifications = JSON.parse(localStorage.getItem("animal_sns_custom_notifications") || "[]");
        localStorage.setItem("animal_sns_custom_notifications", JSON.stringify([newNotification, ...storedNotifications]));
        localStorage.setItem("animal_sns_notifications_read", "false");
        setHasUnread(true);
      }
    }

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentReaction = post.reactions[type as keyof typeof post.reactions];
        const newActive = !currentReaction.active;
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [type]: {
              count: newActive ? currentReaction.count + 1 : Math.max(0, currentReaction.count - 1),
              active: newActive
            }
          }
        };
      }
      return post;
    }));
  };

  if (!user) return <div className="min-h-screen bg-white" />;

  return (
    <div className="pb-20 min-h-screen bg-lake-pattern">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-sage/10 px-6 py-4">
        <h1 className="text-xl font-bold text-sage">湖のタイムライン</h1>
        <p className="text-xs text-zinc-400">水面に映る、穏やかな時間</p>
      </header>

      {/* 投稿一覧 */}
      <div className="flex flex-col gap-4 p-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-sage/5 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={() => router.push(`/profile/${post.userId}`)}
                className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                {ANIMAL_DATA[post.animalType as AnimalType]?.emoji || "🐾"}
              </button>
              <div 
                onClick={() => router.push(`/profile/${post.userId}`)}
                className="cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-full group-hover:bg-sage/20 transition-all">
                    {post.title}
                  </span>
                </div>
                <h3 className="font-bold text-zinc-800 group-hover:text-sage transition-all">{post.nickname}</h3>
              </div>
            </div>
            <p className="text-zinc-700 leading-relaxed mb-6">
              {post.translatedContent}
            </p>
            {/* リアクション（数値なし） */}
            <div className="flex gap-6 items-center border-t border-sage/5 pt-4">
              <button 
                onClick={() => toggleReaction(post.id, "tail")}
                className={`flex items-center gap-1.5 transition-all active:scale-110 ${post.reactions.tail.active ? "reaction-glow" : "text-zinc-300 hover:text-sage"}`}
              >
                <Heart size={18} fill={post.reactions.tail.active ? "currentColor" : "none"} />
                <span className="text-[10px] font-medium uppercase tracking-wider">しっぽ</span>
              </button>
              <button 
                onClick={() => toggleReaction(post.id, "groom")}
                className={`flex items-center gap-1.5 transition-all active:scale-110 ${post.reactions.groom.active ? "reaction-glow" : "text-zinc-300 hover:text-sage"}`}
              >
                <Sparkles size={18} />
                <span className="text-[10px] font-medium uppercase tracking-wider">毛づくろい</span>
              </button>
              <button 
                onClick={() => toggleReaction(post.id, "stretch")}
                className={`flex items-center gap-1.5 transition-all active:scale-110 ${post.reactions.stretch.active ? "reaction-glow" : "text-zinc-300 hover:text-sage"}`}
              >
                <Coffee size={18} />
                <span className="text-[10px] font-medium uppercase tracking-wider">のび</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 下部ナビゲーション */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[380px] bg-white/90 backdrop-blur-xl border border-sage/20 shadow-2xl rounded-full px-8 py-3 flex items-center justify-between z-20">
        <button 
          onClick={() => router.push("/")}
          className="text-zinc-400 hover:text-sage transition-colors"
        >
          森
        </button>
        <button className="text-sage font-bold">湖</button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-12 h-12 bg-sage rounded-full flex items-center justify-center text-white shadow-lg shadow-sage/40 hover:scale-110 active:scale-95 transition-all cursor-pointer -translate-y-2"
        >
          <span className="text-3xl mb-1">+</span>
        </button>
        <button 
          onClick={() => router.push("/notifications")}
          className="text-zinc-400 hover:text-sage transition-colors relative"
        >
          {hasUnread && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full border border-white" />
          )}
          通知
        </button>
        <button 
          onClick={() => router.push("/profile")}
          className="text-zinc-400 hover:text-sage transition-colors"
        >
          自分
        </button>
      </div>

      {/* 投稿モーダル */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-sage/20 backdrop-blur-sm z-30 flex justify-center"
            >
              <div className="w-full max-w-[430px] h-full" />
            </motion.div>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[40px] p-8 pb-12 z-40 shadow-2xl border-t border-sage/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-zinc-800">湖のほとりで、今のきもちを</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="text-zinc-400" size={24} />
                </button>
              </div>

              {!translatedResult ? (
                <div className="flex flex-col gap-4">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="湖に投げかけるように、人間の言葉を入力してみてね..."
                    className="w-full h-32 p-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-sage/20 resize-none text-zinc-700"
                  />
                  <button
                    onClick={handleTranslate}
                    disabled={!inputValue.trim() || isTranslating}
                    className={`h-14 rounded-full font-bold transition-all ${
                      isTranslating 
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                        : "bg-sage text-white shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {isTranslating ? "波紋が広がっています..." : "動物の言葉に翻訳する"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-sage/5 border border-sage/10 text-center"
                  >
                    <p className="text-sage font-medium text-lg leading-relaxed italic">
                      {translatedResult}
                    </p>
                  </motion.div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTranslatedResult("")}
                      className="flex-1 h-14 rounded-full font-bold text-zinc-400 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                    >
                      やり直す
                    </button>
                    <button
                      onClick={handlePost}
                      className="flex-[2] h-14 rounded-full font-bold text-white bg-sage shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      このまま湖に流す
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 称号解放通知 */}
      <AnimatePresence>
        {newTitles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sage/20 backdrop-blur-md"
          >
            <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-sage/10 max-w-sm w-full text-center space-y-6">
              <div className="w-20 h-20 bg-mustard/10 rounded-full flex items-center justify-center text-4xl mx-auto border-2 border-mustard/20 shadow-inner">
                ✨
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-800">新しい称号を獲得！</h2>
                <div className="flex flex-col gap-2">
                  {newTitles.map(t => (
                    <div key={t.id} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-mustard/10 text-mustard font-bold rounded-full border border-mustard/20">
                      <Award size={16} />
                      {t.name}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-zinc-400">
                プロフィール画面から<br />変更できるようになりました。
              </p>
              <button
                onClick={() => setNewTitles([])}
                className="w-full h-14 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 active:scale-95 transition-all"
              >
                うれしい！
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
