"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Coffee, Cloud, Moon, Sun, Heart, Award, ArrowRight, Sparkles, BookOpen, PenTool } from "lucide-react";
import { ANIMAL_DATA } from "@/lib/constants";
import { registerUser } from "@/app/actions/user";

const QUESTIONS = [
  {
    id: 1,
    text: "休日の午後は、どう過ごしたい？",
    options: [
      { id: "a", text: "日向でうとうと、のんびりしたい", point: { cat: 2, dog: 1 } },
      { id: "b", text: "外の空気を吸いに、少し歩きたい", point: { dog: 2, rabbit: 1 } },
      { id: "c", text: "お気に入りの場所で、じっとしていたい", point: { beaver: 2, cat: 1 } },
    ],
  },
  {
    id: 2,
    text: "知らない人がこっちを見ている。どう思う？",
    options: [
      { id: "a", text: "まずは様子をうかがう", point: { cat: 2, rabbit: 1 } },
      { id: "b", text: "嬉しくなって、しっぽ（？）を振っちゃう", point: { dog: 2 } },
      { id: "c", text: "気づかないふりをして、自分の作業を続ける", point: { beaver: 2 } },
    ],
  },
  {
    id: 3,
    text: "今のあなたの気分は、天気でいうと？",
    options: [
      { id: "a", text: "ぽかぽかの小春日和", point: { dog: 1, rabbit: 2 } },
      { id: "b", text: "しっとりとした雨上がり", point: { cat: 1, beaver: 2 } },
      { id: "c", text: "澄み渡る夜空", point: { cat: 2 } },
    ],
  },
];

const ANIMAL_RESULTS = ANIMAL_DATA;

const INITIAL_TITLES = [
  { name: "ふわふわの新参者", id: "initial-1" },
  { name: "ぴかぴかの新入り肉球", id: "initial-2" },
  { name: "震えるしっぽの冒険家", id: "initial-3" },
];

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); 
  const [scores, setScores] = useState({ dog: 0, cat: 0, rabbit: 0, beaver: 0 });
  const [result, setResult] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState(INITIAL_TITLES[0].name);
  const [userName, setUserName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isStamping, setIsStamping] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleStart = () => setCurrentStep(1);

  const handleAnswer = (point: Record<string, number>) => {
    const newScores = { ...scores };
    Object.entries(point).forEach(([key, val]) => {
      newScores[key as keyof typeof scores] += val;
    });
    setScores(newScores);

    if (currentStep < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      const winner = Object.entries(newScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      setResult(winner);
      setCurrentStep(QUESTIONS.length + 1);
    }
  };

  const handleFinishDiagnosis = () => {
    setCurrentStep(QUESTIONS.length + 3);
  };

  const finishRegistration = async () => {
    if (!userName.trim()) {
      setNameError("なまえを入力してね");
      return;
    }
    if (userName.length > 6) {
      setNameError("6文字以内で入力してね");
      return;
    }
    if (!/^[ぁ-んァ-ヶー]*$/.test(userName)) {
      setNameError("ひらがな・カタカナで入力してね");
      return;
    }

    setNameError(null);
    setIsStamping(true);
    setIsRegistering(true);
    
    try {
        await registerUser(userName, result!, selectedTitle);
        
        setTimeout(() => {
          setShowStamp(true);
          setTimeout(() => {
            setIsWelcomeModalOpen(true);
            setIsStamping(false);
            setIsRegistering(false);
          }, 1500);
        }, 1000);
    } catch (e) {
        console.error(e);
        setNameError("登録に失敗しました");
        setIsStamping(false);
        setIsRegistering(false);
    }
  };

  const goToForest = () => {
    if (result && userName) {
      const userData = {
        name: userName,
        animal: result,
        title: selectedTitle,
        unlockedTitles: [selectedTitle],
        postCount: 0,
        forestPostCount: 0,
        lakePostCount: 0,
        reactionTailCount: 0,
        reactionGroomCount: 0,
        reactionStretchCount: 0,
      };
      localStorage.setItem("animal_sns_user", JSON.stringify(userData));
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] relative overflow-hidden flex flex-col items-center justify-center p-6 text-zinc-800">
      {/* 背景：LPとは違う、より明るく温かいテクスチャ */}
      <div className="absolute inset-0 z-0 opacity-40" 
        style={{ 
          backgroundImage: `url('https://www.transparenttextures.com/patterns/cream-paper.png')`,
        }} 
      />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sage/10 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-[380px] flex flex-col gap-8"
          >
            {/* 住民台帳スタイル：紙の質感を強調 */}
            <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(178,172,136,0.15)] border border-sage/10 overflow-hidden relative z-10">
              <div className="bg-sage/5 px-8 py-4 border-b border-sage/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PenTool size={14} className="text-sage" />
                  <span className="text-[10px] font-bold text-sage uppercase tracking-[0.2em]">Official Registry</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-sage/20" />
              </div>

              <div className="p-10 text-center space-y-8 relative">
                <div className="space-y-3">
                  <div className="inline-block px-3 py-1 rounded-full bg-sage/10 text-sage text-[9px] font-black uppercase tracking-widest">
                    Invitation
                  </div>
                  <h1 className="text-3xl font-black text-zinc-800 leading-tight tracking-tighter">
                    住人登録の手引き
                  </h1>
                  <p className="text-xs text-zinc-400 font-medium">
                    ようこそ。あなたの新しい生活を<br/>ここから始めましょう。
                  </p>
                </div>

                <div className="flex justify-center py-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-sage/5 border-2 border-dashed border-sage/20 flex items-center justify-center">
                      <span className="text-3xl opacity-30">🐾</span>
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-sage/10 flex items-center justify-center text-xl"
                    >
                      📜
                    </motion.div>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed text-left bg-zinc-50 p-4 rounded-2xl border border-zinc-100 italic">
                  「昨日までの自分を脱いで、動物になろう」<br/>
                  そんなあなたのための、簡単な質問と名前の登録です。
                </p>

                {/* ビーバーくん：受付担当として右下に配置 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-4 -right-2 z-20"
                >
                  <img 
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Beaver.png" 
                    alt="Beaver Clerk"
                    className="w-20 h-20 drop-shadow-xl"
                  />
                </motion.div>
              </div>
            </div>

            <div className="space-y-3 px-2 relative z-10">
              <button
                onClick={handleStart}
                className="w-full h-16 bg-sage text-white rounded-2xl font-bold shadow-xl shadow-sage/20 hover:bg-sage/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span className="text-lg">登録手続きをはじめる</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full h-14 bg-transparent text-zinc-400 font-bold text-sm hover:text-sage transition-all"
              >
                入り口にもどる
              </button>
            </div>
          </motion.div>
        )}

        {currentStep >= 1 && currentStep <= QUESTIONS.length && (
            <motion.div
            key={`q-${currentStep}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-sage/10 p-10 space-y-8"
          >
            {/* 質問画面も「紙」の質感に */}
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-sage uppercase tracking-widest">Question {currentStep}</p>
                <div className="h-1 w-8 bg-sage/20 rounded-full" />
              </div>
              <p className="text-xs font-bold text-zinc-300 italic">{currentStep} / {QUESTIONS.length}</p>
            </div>

            <h2 className="text-xl font-bold text-zinc-700 leading-snug min-h-[4rem]">
              {QUESTIONS[currentStep - 1].text}
            </h2>

            <div className="space-y-4">
              {QUESTIONS[currentStep - 1].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.point)}
                  className="w-full p-5 text-left bg-zinc-50/50 rounded-[24px] border border-zinc-100 hover:border-sage/20 hover:bg-white hover:shadow-md hover:translate-x-1 transition-all duration-300 group flex items-center gap-5 relative"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-xs font-black text-zinc-300 group-hover:border-sage/40 group-hover:text-sage transition-all duration-300 shadow-sm">
                    {option.id.toUpperCase()}
                  </div>
                  <span className="text-[13px] font-bold text-zinc-500 group-hover:text-zinc-800 transition-colors duration-300 flex-1 leading-relaxed">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ... (診断結果以降の画面も同様に紙質感へ微調整) ... */}
        {currentStep > QUESTIONS.length && currentStep <= QUESTIONS.length + 1 && result && (
             <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center space-y-8 max-w-sm bg-white rounded-[32px] shadow-2xl border border-sage/10 p-10"
          >
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-mustard uppercase tracking-widest">Diagnosis Result</p>
                <h2 className="text-xl font-black text-zinc-700 italic underline decoration-mustard/30 decoration-4 underline-offset-4">Identity Identified</h2>
              </div>
              
              <div className="relative inline-block py-4">
                <div className="text-8xl relative z-10">{ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].emoji}</div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-2 right-0 w-10 h-10 bg-mustard rounded-full flex items-center justify-center text-white text-xl border-4 border-white shadow-lg z-20"
                >
                  ✓
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-zinc-800">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].name}
                </h2>
                <p className="text-xs text-zinc-500 leading-relaxed px-4 font-medium italic">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].description}
                </p>
              </div>
            </div>

            <div className="p-6 bg-sage/5 rounded-[24px] border border-sage/10 space-y-4 text-left">
              <p className="text-[9px] text-sage font-black uppercase tracking-[0.2em] border-b border-sage/10 pb-2 flex items-center gap-2">
                <Award size={12} /> Select Initial Title
              </p>
              <div className="grid grid-cols-1 gap-2">
                {INITIAL_TITLES.map((title) => (
                  <button
                    key={title.id}
                    onClick={() => setSelectedTitle(title.name)}
                    className={`p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                      selectedTitle === title.name
                        ? "bg-white border-sage text-sage shadow-md"
                        : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-500"
                    }`}
                  >
                    <span>{title.name}</span>
                    {selectedTitle === title.name && <div className="w-1.5 h-1.5 rounded-full bg-sage" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleFinishDiagnosis}
                className="w-full h-16 bg-sage text-white rounded-2xl font-bold shadow-xl shadow-sage/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                この姿で進む
              </button>
              <button
                onClick={() => setCurrentStep(QUESTIONS.length + 2)}
                className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-sage transition-colors"
              >
                姿を変更する / Change Persona
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === QUESTIONS.length + 2 && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-sage/10 p-10 text-center space-y-8"
          >
            <div className="space-y-2">
              <p className="text-[10px] font-black text-sage uppercase tracking-widest">Manual Override</p>
              <h2 className="text-xl font-black text-zinc-700 italic">CHOOSE IDENTITY</h2>
              <p className="text-zinc-400 text-[10px] font-bold">あなたが一番しっくりくる姿を選んでください。</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ANIMAL_RESULTS).map(([id, animal]) => (
                <button
                  key={id}
                  onClick={() => {
                    setResult(id);
                    // 修正：即座に完了するのではなく、診断結果画面（Identity Identified）に戻る
                    setTimeout(() => setCurrentStep(QUESTIONS.length + 1), 300);
                  }}
                  className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-2 ${
                    result === id 
                      ? "border-sage bg-sage/5 shadow-inner" 
                      : "border-zinc-50 bg-white hover:border-sage/20 shadow-sm"
                  }`}
                >
                  <span className="text-4xl">{animal.emoji}</span>
                  <span className="font-bold text-[11px] text-zinc-600 uppercase tracking-tighter">{animal.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(QUESTIONS.length + 1)}
              className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-sage transition-colors"
            >
              診断結果に戻る / Return to Result
            </button>
          </motion.div>
        )}

        {currentStep === QUESTIONS.length + 3 && (
            <motion.div
            key="name-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center space-y-8 w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-sage/10 p-10"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-black text-sage uppercase tracking-widest">Final Step</p>
              <h1 className="text-2xl font-black text-zinc-800">お名前の登録</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">Enter Your Resident Name</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="なまえ"
                  className={`w-full h-20 px-6 text-center text-3xl font-black bg-zinc-50 rounded-2xl border-2 transition-all focus:outline-none tracking-widest ${
                    nameError ? "border-red-400" : "border-sage/20 focus:border-sage"
                  }`}
                  autoFocus
                />
                <div className="absolute top-0 left-0 p-3 opacity-10">
                  < PenTool size={16} />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between px-2 text-[10px] font-black text-sage/40 uppercase tracking-widest">
                  <span>{selectedTitle}</span>
                  <span>{userName.length} / 6</span>
                </div>
                <AnimatePresence>
                  {nameError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-400 font-bold uppercase">{nameError}</motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <p className="text-[9px] text-zinc-400 leading-relaxed font-medium bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              ※ひらがな・カタカナ6文字以内で入力してください。この名前は市民名簿に登録され、動物たちの世界での公式な呼び名となります。
            </p>

            <button
              onClick={finishRegistration}
              disabled={isRegistering}
              className="w-full h-16 bg-sage text-white rounded-2xl font-bold shadow-xl shadow-sage/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isRegistering ? "登録中..." : "登録を完了する"}
            </button>
          </motion.div>
        )}

        {/* スタンプ・ウェルカムモーダルは「手続きの完了」なので、以前の特別演出を維持 */}
        {isStamping && (
          <motion.div
            key="immigration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#FDFCFB] flex flex-col items-center justify-center p-6"
          >
            {/* 背景テクスチャの継承 */}
            <div className="absolute inset-0 z-0 opacity-40" 
              style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cream-paper.png')` }} 
            />

            <div className="relative z-10 w-full max-w-[340px] aspect-[3/4] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(178,172,136,0.15)] border border-sage/10 overflow-hidden flex flex-col">
              <div className="bg-sage/5 px-6 py-4 border-b border-sage/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PenTool size={12} className="text-sage" />
                  <span className="text-[9px] font-black text-sage uppercase tracking-[0.2em]">Final Certification</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-sage/20" />
              </div>
              
              <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8 relative">
                {/* 決定した姿を鮮やかに表示 */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-sage/5 flex items-center justify-center text-6xl shadow-inner relative z-10">
                    {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.emoji}
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-sage/10 rounded-full blur-xl"
                  />
                </div>
                
                <div className="space-y-5 w-full">
                  <div className="text-center space-y-1">
                    <p className="text-[8px] text-sage font-black uppercase tracking-widest opacity-50 italic">Citizen Name</p>
                    <p className="font-black text-2xl text-zinc-800 tracking-wider">{userName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-sage/5">
                    <div className="space-y-1">
                      <p className="text-[8px] text-sage font-black uppercase tracking-widest opacity-50">Identity</p>
                      <p className="font-bold text-xs text-zinc-600">{ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-sage font-black uppercase tracking-widest opacity-50">Date</p>
                      <p className="font-bold text-xs text-zinc-600">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showStamp && (
                    <motion.div
                      initial={{ scale: 3, opacity: 0, rotate: -20 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <div className="border-[6px] border-sage/40 rounded-2xl px-5 py-2 text-sage/40 font-black text-4xl uppercase tracking-tighter transform flex flex-col items-center bg-white/10 backdrop-blur-[2px] shadow-sm">
                        <span className="text-[10px] tracking-[0.3em] mb-1 font-black">Official</span>
                        <span>登録完了</span>
                        <span className="text-[8px] mt-1 font-bold">{new Date().toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="px-6 py-4 bg-sage/5 border-t border-sage/10 text-center">
                <p className="text-[8px] text-sage/60 font-bold italic tracking-widest animate-pulse">
                  Synchronizing Resident Data...
                </p>
              </div>
            </div>
            
            <div className="mt-10 flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-sage"
                  />
                ))}
              </div>
              <p className="text-sage font-black text-[10px] uppercase tracking-[0.4em] mt-2">Processing</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWelcomeModalOpen && result && (
            <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-sage/40 backdrop-blur-md z-[70] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-[380px] text-center shadow-2xl space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl"
                >
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].emoji}
                </motion.div>
                <div className="space-y-1">
                  <p className="text-sage font-bold text-sm tracking-widest">{selectedTitle}</p>
                  <h2 className="text-3xl font-bold text-zinc-800">
                    {userName}さん
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-zinc-500 leading-relaxed">
                  ようこそ、穏やかな世界へ。<br />
                  まずは賑やかな「街」から、<br />
                  あなたの新しい生活を始めましょう。
                </p>
              </div>

              <button
                onClick={goToForest}
                className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-105 active:scale-95 transition-all"
              >
                街へすすむ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
