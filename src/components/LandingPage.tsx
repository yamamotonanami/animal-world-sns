"use client";

import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Map, MessageSquare, Award, ArrowRight, LogOut } from "lucide-react";
import { useRef } from "react";
import { useClerk } from "@clerk/nextjs";
import { ANIMAL_DATA } from "@/lib/constants";

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
    await signOut(() => router.push("/"));
    router.refresh();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-offwhite text-zinc-800 selection:bg-sage/20">
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 scale-105"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.9)), url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 w-full max-w-[430px] px-6 flex flex-col items-center gap-10"
        >
          <div className="relative w-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="bg-white/40 backdrop-blur-xl p-10 rounded-[48px] border border-white/40 shadow-2xl text-center space-y-8 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage/10 text-sage text-[10px] font-bold tracking-[0.2em] uppercase">
                <Sparkles size={12} />
                Animal Social Network
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-2">
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sage text-sm font-bold tracking-[0.3em] text-left pl-2"
                  >
                    さあ、あなたは今日、
                  </motion.p>
                  
                  <div className="relative">
                    <motion.div
                      initial={{ opacity: 0, scale: 0, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.6
                      }}
                      className="absolute left-4 top-[2.8rem] z-20 w-16 h-16 rounded-2xl overflow-hidden shadow-xl"
                    >
                      <img 
                        src={ANIMAL_DATA.beaver.iconUrl} 
                        alt="Beaver Character"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    <motion.h1 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-[2.6rem] font-black text-zinc-800 leading-[1.1] tracking-tighter text-right pr-2 relative z-10"
                    >
                      どの尻尾で<br/>歩く？
                    </motion.h1>
                  </div>
                </div>
                
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "2rem" }}
                  transition={{ delay: 0.8 }}
                  className="h-1 bg-sage/20 mx-auto rounded-full" 
                />
                
                <p className="text-sm text-zinc-500 font-bold leading-relaxed tracking-tighter italic">
                  昨日までの自分を脱いで、<br/>動物になろう。
                </p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-mustard/20 rounded-full blur-2xl"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-sage/20 rounded-full blur-2xl"
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full space-y-4 px-4"
          >
            {!user ? (
              <>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="w-full h-18 bg-sage text-white rounded-[32px] font-bold shadow-2xl shadow-sage/30 hover:shadow-sage/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center relative group"
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
                  className="w-full h-18 bg-white/80 backdrop-blur-md text-zinc-500 rounded-[32px] font-bold border border-sage/10 shadow-lg hover:bg-white transition-all flex items-center relative"
                >
                  <div className="absolute left-4 w-10 h-10 bg-sage/5 rounded-2xl flex items-center justify-center text-xl">🏠</div>
                  <div className="w-full text-center">
                    <span className="block text-[10px] opacity-50 font-bold tracking-wider uppercase">Enter Habitat</span>
                    <span className="text-lg">すみかに入る</span>
                  </div>
                </button>
              </>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] border border-mustard/30 shadow-xl space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 bg-mustard/10 rounded-full flex items-center justify-center text-2xl">👋</div>
                  <div>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Welcome Back!</p>
                    <p className="text-sm font-bold text-zinc-700">アカウント認証は完了しています</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/diagnosis")}
                  className="w-full h-16 bg-mustard text-white rounded-2xl font-bold shadow-lg shadow-mustard/20 flex items-center justify-center gap-3 hover:bg-mustard/90 transition-all hover:scale-[1.02]"
                >
                  住人登録を完了する
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full py-2 text-[10px] text-zinc-400 font-bold flex items-center justify-center gap-1 hover:text-zinc-600 transition-colors"
                >
                  <LogOut size={12} /> ログアウトしてやり直す
                </button>
              </div>
            )}
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] font-bold text-sage/40 tracking-[0.3em] uppercase">Scroll Down</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-sage/40 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      <section className="py-24 px-8 space-y-20 max-w-[430px] mx-auto">
        <div className="space-y-12">
          <FeatureItem 
            icon={<MessageSquare className="text-sage" />}
            title="言葉はしぐさに変わる"
            description="あなたの綴った言葉は、AIによって動物たちの愛らしいしぐさに翻訳されます。難しい話は抜きにして、ただ「存在」を伝え合いましょう。"
          />
          <FeatureItem 
            icon={<Map className="text-sage" />}
            title="三つの居場所"
            description="賑やかな「街」、静かな「森」、透き通る「湖」。その時の気分に合わせて、好きな場所で静かに過ごすことができます。"
          />
          <FeatureItem 
            icon={<Award className="text-sage" />}
            title="数字のない評価"
            description="「いいね」の数はありません。届くのは、誰かがあなたの投稿を見て「しっぽを振った」という、温かな気配だけです。"
          />
        </div>

        <div className="p-8 rounded-[40px] bg-sage/5 border border-sage/10 space-y-6 text-center">
          <div className="text-4xl">🌱</div>
          <h3 className="text-xl font-bold text-sage">さあ、動物たちの世界へ</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            ニックネームを決めるだけで、あなたの住人登録は完了します。複雑な設定も、現実の繋がりも必要ありません。
          </p>
          <button
            onClick={() => router.push("/sign-up")}
            className="w-full h-14 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/20"
          >
            住人登録をはじめる
          </button>
        </div>
      </section>

      <footer className="py-12 text-center space-y-4">
        <p className="text-[10px] text-zinc-300 font-bold tracking-[0.5em] uppercase">
          Peaceful World x AI Technology
        </p>
        <p className="text-[9px] text-zinc-200">© 2026 Animal World SNS</p>
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
