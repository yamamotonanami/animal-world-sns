"use client";

import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles, Map, MessageSquare, Award, ArrowRight, LogOut, PawPrint } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { ANIMAL_DATA } from "@/lib/constants";

// 足跡のアニメーションコンポーネント
const WalkingFootprints = () => {
  const [footprints, setFootprints] = useState<{ id: number; x: number; y: number; rotate: number; scale: number; opacity: number }[]>([]);
  // 現在の歩行パスの状態を管理
  const pathRef = useRef({
    stepCount: 0,
    maxSteps: 0,
    currentX: 0,
    currentY: 0,
    directionX: 0, // 1: 右へ, -1: 左へ
    directionY: 0, // 上下の揺らぎ
  });

  const startNewPath = () => {
    // 新しいパスの開始地点と方向を決定
    // 開始位置：右端 (x: 150あたり)
    const startX = 140; 
    const startY = -120; // ベースの高さ
    
    pathRef.current = {
      stepCount: 0,
      maxSteps: 8 + Math.floor(Math.random() * 3), // 8〜10歩（画面を横切るくらい）
      currentX: startX,
      currentY: startY,
      directionX: -1, 
      directionY: 0, 
    };
  };

  useEffect(() => {
    // 初回パス設定
    startNewPath();

    const interval = setInterval(() => {
      const { stepCount, maxSteps, currentX } = pathRef.current;

      // パス終了条件
      if (stepCount >= maxSteps) {
        startNewPath();
        return;
      }

      const id = Date.now();
      
      // 一歩進める（左へ一定距離）
      const strideX = 40; 
      const nextX = currentX - strideX;
      
      // 波の動き (sin波) + 全体的な上昇トレンド
      // 右(140)から左(-140)へ進むにつれて、yを上げる（値を小さくする）
      const slope = 0.3; // 傾き係数
      const lift = (140 - nextX) * slope; // 進んだ距離分だけ上に持ち上げる
      
      const waveY = Math.sin(nextX * 0.05) * 30; 
      const nextY = -120 - lift + waveY; // ベース位置 - 上昇分 + 波

      // 足跡の向き：波の接線 + 全体の上昇傾き
      const angle = Math.cos(nextX * 0.05) * 30; 
      const rotate = -90 + angle - 15; // 全体に少し上向き(-15度)を追加

      const scale = 0.9 + Math.random() * 0.2;

      setFootprints((prev) => {
        const newFootprints = [...prev, { id, x: nextX, y: nextY, rotate, scale, opacity: 0.8 }];
        // 一定数以上になったら古いものを消す
        if (newFootprints.length > 6) {
          return newFootprints.slice(1); // 先頭（古いもの）を削除
        }
        return newFootprints;
      });

      // 状態更新
      pathRef.current.currentX = nextX;
      pathRef.current.currentY = nextY;
      pathRef.current.stepCount += 1;

    }, 600); // テンポよく

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-0">
      <AnimatePresence>
        {footprints.map((fp) => (
          <motion.div
            key={fp.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: fp.opacity, scale: fp.scale }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, exit: { duration: 2 } }}
            className="absolute text-[#B2805E]"
            style={{
              left: `calc(50% + ${fp.x}px)`,
              top: `calc(50% + ${fp.y}px)`,
              rotate: fp.rotate,
              filter: "drop-shadow(0px 2px 2px rgba(255,255,255,0.8))"
            }}
          >
            <PawPrint fill="currentColor" size={32} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage({ user }: { user: any }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-offwhite text-zinc-800 selection:bg-sage/20">
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 scale-105"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.9)), url('/backgrounds/town.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 w-full max-w-[430px] mx-auto px-6 flex flex-col items-center gap-8 pt-4"
        >
          <div className="relative w-full flex flex-col items-center">
            {/* 足跡アニメーション */}
            <WalkingFootprints />

            {/* ロゴエリア（コンテナ） */}
            <div className="relative w-full max-w-[340px] aspect-[4/3] flex items-center justify-center">
              {/* ビーバーキャラクター */}
              <motion.div
                initial={{ opacity: 0, scale: 0, x: -20, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0, rotate: -10 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                className="absolute bottom-[15%] -left-[5%] w-[45%] z-20"
              >
                <img 
                  src="/logo/beaver_lp.png" 
                  alt="Beaver Character"
                  className="w-full h-auto drop-shadow-xl"
                />
              </motion.div>

              {/* ロゴ本体 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: [0, -10, 0] 
                }}
                transition={{ 
                  opacity: { duration: 0.8 },
                  scale: { duration: 0.8, type: "spring" },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
                }}
                className="relative z-10 w-[90%] ml-auto"
              >
                <img 
                  src="/logo/title_logo.png" 
                  alt="ZooTalk Logo"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </motion.div>
            </div>

            {/* キャッチコピー */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="relative z-10 -mt-8 pl-[20%] sm:pl-24 text-base sm:text-lg font-bold text-[#B2805E] tracking-wider text-center w-full leading-relaxed"
              style={{ 
                textShadow: "2px 2px 0px #ffffff, -2px -2px 0px #ffffff, -2px 2px 0px #ffffff, 2px -2px 0px #ffffff, 2px 0px 0px #ffffff, -2px 0px 0px #ffffff, 0px 2px 0px #ffffff, 0px -2px 0px #ffffff" 
              }}
            >
              昨日までの自分を脱いで、<br />動物になろう！
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full space-y-4 px-4 mt-8"
          >
            {!user ? (
              <>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="w-full h-18 bg-[#9BC385] text-white rounded-[32px] font-bold shadow-2xl shadow-[#9BC385]/30 hover:shadow-[#9BC385]/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center relative group"
                >
                  <div className="absolute left-4 w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🎫</div>
                  <div className="w-full text-center">
                    <span className="block text-[10px] opacity-70 font-bold tracking-wider uppercase">New Resident</span>
                    <span className="text-lg">住人登録する</span>
                  </div>
                  <ArrowRight className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => router.push("/sign-in")}
                  className="w-full h-18 bg-white/90 backdrop-blur-md text-[#B2805E] rounded-[32px] font-bold border-2 border-[#E7A950] shadow-lg hover:bg-white transition-all flex items-center relative"
                >
                  <div className="absolute left-4 w-10 h-10 bg-[#E7A950]/10 rounded-2xl flex items-center justify-center text-xl">🏠</div>
                  <div className="w-full text-center">
                    <span className="block text-[10px] opacity-60 font-bold tracking-wider uppercase text-[#B2805E]">Enter Habitat</span>
                    <span className="text-lg">すみかに入る</span>
                  </div>
                </button>
              </>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] border-2 border-[#E7A950] shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 bg-[#E7A950]/10 rounded-full flex items-center justify-center text-2xl">👋</div>
                  <div>
                    <p className="text-xs text-[#B2805E]/60 font-bold uppercase tracking-wider">Welcome Back!</p>
                    <p className="text-sm font-bold text-[#B2805E]">アカウント認証は完了しています</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/diagnosis")}
                  className="w-full h-16 bg-[#E7A950] text-white rounded-2xl font-bold shadow-lg shadow-[#E7A950]/20 flex items-center justify-center gap-3 hover:bg-[#E7A950]/90 transition-all hover:scale-[1.02]"
                >
                  住人登録を完了する
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full py-2 text-[10px] text-[#B2805E]/60 font-bold flex items-center justify-center gap-1 hover:text-[#B2805E] transition-colors"
                >
                  <LogOut size={12} /> ログアウトしてやり直す
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-8 space-y-20 max-w-[430px] mx-auto">
        <div className="space-y-12">
          <FeatureItem 
            icon={<MessageSquare className="text-[#E7A950]" />}
            title="言葉はしぐさに変わる"
            description="あなたの綴った言葉は、AIによって動物たちの愛らしいしぐさに翻訳されます。難しい話は抜きにして、ただ「存在」を伝え合いましょう。"
          />
          <FeatureItem 
            icon={<Map className="text-[#9BC385]" />}
            title="三つの居場所"
            description="賑やかな「街」、静かな「森」、透き通る「湖」。その時の気分に合わせて、好きな場所で静かに過ごすことができます。"
          />
          <FeatureItem 
            icon={<Award className="text-[#B2805E]" />}
            title="数字のない評価"
            description="「いいね」の数はありません。届くのは、誰かがあなたの投稿を見て「しっぽを振った」という、温かな気配だけです。"
          />
        </div>

        <div className="p-8 rounded-[40px] bg-[#9BC385]/10 border border-[#9BC385]/20 space-y-6 text-center">
          <div className="text-4xl">🌱</div>
          <h3 className="text-xl font-bold text-[#9BC385]">さあ、動物たちの世界へ</h3>
          <p className="text-xs text-[#B2805E] leading-relaxed">
            ニックネームを決めるだけで、あなたの住人登録は完了します。複雑な設定も、現実の繋がりも必要ありません。
          </p>
          <button
            onClick={() => router.push("/sign-up")}
            className="w-full h-14 bg-[#9BC385] text-white rounded-full font-bold shadow-lg shadow-[#9BC385]/20"
          >
            住人登録をはじめる
          </button>
        </div>
      </section>

      <footer className="py-12 text-center space-y-4">
        <p className="text-[10px] text-[#B2805E]/40 font-bold tracking-[0.5em] uppercase">
          Peaceful World x AI Technology
        </p>
        <p className="text-[9px] text-[#B2805E]/30">© 2026 Animal World SNS</p>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-6"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-bold text-zinc-700">{title}</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
