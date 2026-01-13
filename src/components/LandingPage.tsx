"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-zinc-800">
      {/* 背景画像レイヤー */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.8)), url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 w-full max-w-[430px] p-8 flex flex-col gap-10">
        {/* キャッチコピー */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-sage/20 text-sage text-xs font-bold tracking-widest mb-4">
            ANIMAL SOCIAL NETWORK
          </div>
          <h1 className="text-4xl font-black text-sage leading-tight tracking-tighter drop-shadow-sm">
            言葉を脱いで、<br/>
            <span className="text-zinc-700">動物になろう。</span>
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed font-medium bg-white/60 p-4 rounded-2xl backdrop-blur-sm">
            ここは、肩書きも数字もない優しい世界。<br/>
            あなたの言葉はAIによって<br/>
            愛らしい動物のしぐさに翻訳されます。
          </p>
        </motion.div>

        {/* アクションボタン */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <button
            onClick={() => router.push("/sign-up")}
            className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-xl shadow-sage/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-xl">🎫</span>
            <div className="text-left">
              <span className="block text-xs opacity-80 font-normal">はじめての方</span>
              <span className="text-lg">住人登録する</span>
            </div>
          </button>

          <button
            onClick={() => router.push("/sign-in")}
            className="w-full h-16 bg-white text-zinc-600 rounded-full font-bold shadow-lg border-2 border-transparent hover:border-sage/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">🏠</span>
            <div className="text-left">
              <span className="block text-xs opacity-60 font-normal">すでに住人の方</span>
              <span className="text-lg">お家に帰る</span>
            </div>
          </button>
        </motion.div>

        {/* フッター的な装飾 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-0 w-full text-center"
        >
          <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
            Peaceful World x AI Technology
          </p>
        </motion.div>
      </div>
    </div>
  );
}
