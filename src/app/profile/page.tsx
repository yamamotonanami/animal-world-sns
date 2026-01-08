"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Award, Settings, LogOut, RefreshCw, X } from "lucide-react";
import { TITLES } from "@/lib/mock-data";
import { ANIMAL_DATA, AnimalType } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; animal: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"titles" | "stats">("titles");
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("animal_sns_user");
    if (!savedUser) {
      router.push("/diagnosis");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  const handleTitleChange = (newTitle: string) => {
    if (!user) return;
    const updatedUser = { ...user, title: newTitle };
    setUser(updatedUser);
    localStorage.setItem("animal_sns_user", JSON.stringify(updatedUser));
  };

  const handleAnimalChange = (newAnimal: string) => {
    if (!user) return;
    const updatedUser = { ...user, animal: newAnimal };
    setUser(updatedUser);
    localStorage.setItem("animal_sns_user", JSON.stringify(updatedUser));
    setIsAnimalModalOpen(false);
  };

  const handleLogout = () => {
    if (confirm("森の記憶を消去して、診断からやり直しますか？")) {
      localStorage.removeItem("animal_sns_user");
      router.push("/diagnosis");
    }
  };

  if (!user) return null;

  const animalInfo = ANIMAL_DATA[user.animal] || ANIMAL_DATA.dog;

  return (
    <div className="min-h-screen bg-offwhite pb-24">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-sage/10 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => router.push("/")}
          className="p-2 hover:bg-sage/5 rounded-full transition-colors text-sage"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-zinc-800">プロフィール</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* メインプロフィール */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 rounded-full bg-sage/5 border-2 border-sage/20 flex items-center justify-center text-6xl shadow-inner"
          >
            {animalInfo.emoji}
          </motion.div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-mustard/10 text-mustard text-xs font-bold rounded-full border border-mustard/20">
              <Award size={12} />
              {user.title}
            </div>
            <h2 className="text-2xl font-bold text-zinc-800">{user.name}</h2>
            <p className="text-sm text-zinc-400 font-medium tracking-wide">
              森の「{animalInfo.name}」さん
            </p>
          </div>
        </div>

        {/* 動物の説明カード */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-sage/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xs font-bold text-sage uppercase tracking-[0.2em]">
              あなたの動物人格
            </h3>
            <button 
              onClick={() => setIsAnimalModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-sage/10 text-sage rounded-full text-[10px] font-bold hover:bg-sage/20 transition-all active:scale-95"
            >
              <RefreshCw size={10} />
              姿と性格を変える
            </button>
          </div>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {animalInfo.description}
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="space-y-4">
          <div className="flex p-1 bg-sage/5 rounded-2xl">
            <button 
              onClick={() => setActiveTab("titles")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "titles" ? "bg-white text-sage shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              称号
            </button>
            <button 
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === "stats" ? "bg-white text-sage shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              記録
            </button>
          </div>

          {activeTab === "titles" ? (
            <div className="grid grid-cols-1 gap-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">選択可能な称号</p>
              {/* 初期称号 */}
              {TITLES.initial.map((title) => (
                <button
                  key={title}
                  onClick={() => handleTitleChange(title)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    user.title === title
                      ? "bg-sage/5 border-sage text-sage"
                      : "bg-white border-sage/5 text-zinc-500 hover:border-sage/20"
                  }`}
                >
                  <span className="text-sm font-medium">{title}</span>
                  {user.title === title && <div className="w-2 h-2 rounded-full bg-sage" />}
                </button>
              ))}
              
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mt-2">解放条件のある称号</p>
              {TITLES.unlocked.map((t) => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-4 rounded-2xl border bg-zinc-50 border-zinc-100 text-zinc-300"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">{t.name}</span>
                    <span className="text-[10px]">{t.condition}</span>
                  </div>
                  <Award size={16} className="opacity-30" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-8 border border-sage/5 text-center space-y-4">
              <div className="text-4xl">🌱</div>
              <p className="text-zinc-400 text-sm">
                森での記録は、これからゆっくりと<br />刻まれていきます。
              </p>
            </div>
          )}
        </div>

        {/* 設定・その他 */}
        <div className="pt-4 border-t border-sage/10 flex flex-col gap-2">
          <button className="flex items-center justify-between p-4 text-zinc-500 hover:text-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              <Settings size={20} />
              <span className="text-sm font-medium">アプリ設定</span>
            </div>
            <ChevronLeft size={16} className="rotate-180 opacity-50" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-between p-4 text-red-400 hover:text-red-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span className="text-sm font-medium">診断からやり直す</span>
            </div>
          </button>
        </div>
      </div>

      {/* 下部ナビゲーション（共通化が望ましいが一旦簡易的に） */}
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
        <button className="text-zinc-400 hover:text-sage transition-colors">通知</button>
        <button className="text-sage font-bold">自分</button>
      </div>

      {/* 動物変更モーダル */}
      <AnimatePresence>
        {isAnimalModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAnimalModalOpen(false)}
              className="fixed inset-0 bg-sage/20 backdrop-blur-sm z-[30] flex justify-center"
            >
              <div className="w-full max-w-[430px] h-full" />
            </motion.div>
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[40px] p-8 pb-12 z-[40] shadow-2xl border-t border-sage/10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-zinc-800">姿と性格を変える</h2>
                  <p className="text-xs text-zinc-400">今の名前や過去の投稿はそのままで、姿だけ変えられます。これ以降の投稿は、選んだ動物の性格に変わります。</p>
                </div>
                <button 
                  onClick={() => setIsAnimalModalOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="text-zinc-400" size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(ANIMAL_DATA).map(([id, animal]) => (
                  <button
                    key={id}
                    onClick={() => handleAnimalChange(id)}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                      user.animal === id 
                        ? "border-sage bg-sage/5 shadow-inner" 
                        : "border-sage/10 bg-white hover:border-sage/30 shadow-sm"
                    }`}
                  >
                    <span className="text-4xl">{animal.emoji}</span>
                    <span className="font-bold text-zinc-700">{animal.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
