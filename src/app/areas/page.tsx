"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Map, ChevronRight, PawPrint } from "lucide-react";
import { AREAS_CONFIG } from "@/lib/constants";
import Image from "next/image";

export default function AreasPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-offwhite pb-32 text-zinc-800">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white border-b border-sage/10 px-6 py-4">
        <h1 className="text-lg font-bold">エリアを選択</h1>
        <p className="text-xs text-zinc-400">どこへ遊びに行きますか？</p>
      </header>

      <div className="p-6 space-y-4">
        {Object.values(AREAS_CONFIG).map((area) => (
          <motion.button
            key={area.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const path = area.id === 'town' ? '/?explicit=true' : area.path;
              router.push(path);
            }}
            className="w-full relative h-40 rounded-[32px] overflow-hidden shadow-lg group"
          >
            {/* 背景画像 */}
            <Image
              src={area.bgImage}
              alt={area.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* オーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* コンテンツ */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end text-left text-white">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{area.name}</h2>
                  <p className="text-xs opacity-90">{area.headerDesc}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 下部ナビゲーション (共通) */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-sage/10 pt-3 pb-8 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 w-full px-2">
            <button onClick={() => router.push("/")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center text-lg">🏠</div>
              <span className="text-[10px] font-bold">ホーム</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 text-sage">
              <div className="w-6 h-6 flex items-center justify-center">
                <Map size={20} fill="currentColor" className="opacity-20" />
              </div>
              <span className="text-[10px] font-bold">エリア</span>
              <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-sage" />
            </button>

            <div className="flex flex-col items-center gap-1 text-zinc-400 opacity-20">
              <div className="w-6 h-6 flex items-center justify-center">
                <PawPrint size={20} fill="currentColor" className="-rotate-[45deg]" />
              </div>
              <span className="text-[10px] font-bold">投稿</span>
            </div>

            <button onClick={() => router.push("/notifications")} className="flex flex-col items-center gap-1 text-zinc-400">
              <div className="w-6 h-6 flex items-center justify-center text-lg">🔔</div>
              <span className="text-[10px] font-bold">通知</span>
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
