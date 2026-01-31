"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Coffee, Cloud, Moon, Sun, Heart, Award, ArrowRight, ArrowLeft, Sparkles, BookOpen, PenTool } from "lucide-react";
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
    <div className="min-h-screen bg-[#9BC385]/10 relative overflow-hidden flex flex-col items-center justify-start pt-20 p-6 text-[#B2805E]">
      {/* 背景画像 */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.9)), url('/backgrounds/town.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-[380px] flex flex-col items-center"
          >
            {/* ヘッダー統一 */}
            <div className="relative w-full flex flex-col items-center mb-8">
              <button onClick={() => router.push("/")} className="absolute left-0 -top-12 flex items-center gap-2 text-[#B2805E] font-bold text-sm hover:opacity-70 transition-all bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                <ArrowLeft size={18} />
                <span>もどる</span>
              </button>
              <div className="text-center space-y-2 pt-12">
                <div className="text-4xl drop-shadow-md">📜</div>
                <h1 className="text-3xl font-black text-[#B2805E] tracking-tighter drop-shadow-sm" style={{ textShadow: "2px 0 0 #FFF, -2px 0 0 #FFF, 0 2px 0 #FFF, 0 -2px 0 #FFF, 1.5px 1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px -1.5px 0 #FFF" }}>
                  住人登録の手引き
                </h1>
                <p className="text-[12px] text-[#B2805E] font-black uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                  Invitation to Habitat
                </p>
              </div>
            </div>

            {/* 住民台帳スタイル（カード） */}
            <div className="w-full bg-white/80 backdrop-blur-md rounded-[32px] shadow-xl border border-white/60 overflow-hidden relative z-10">
              <div className="bg-[#9BC385]/10 px-8 py-4 border-b border-[#9BC385]/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PenTool size={14} className="text-[#9BC385]" />
                  <span className="text-[10px] font-bold text-[#9BC385] uppercase tracking-[0.2em]">Official Registry</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#9BC385]/20" />
              </div>

              <div className="p-10 text-center space-y-8 relative">
                {/* ステップ図 */}
                <div className="flex items-center justify-center gap-2 py-2">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#9BC385]/10 flex items-center justify-center text-[#9BC385]">
                      <Coffee size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[#B2805E]">質問</span>
                  </div>
                  {/* Arrow */}
                  <div className="w-6 h-[2px] bg-[#B2805E]/10 rounded-full" />
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#E7A950]/10 flex items-center justify-center text-[#E7A950]">
                      <Sparkles size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[#B2805E]">診断</span>
                  </div>
                  {/* Arrow */}
                  <div className="w-6 h-[2px] bg-[#B2805E]/10 rounded-full" />

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#B2805E]/10 flex items-center justify-center text-[#B2805E]">
                      <PenTool size={20} />
                    </div>
                    <span className="text-[10px] font-black text-[#B2805E]">登録</span>
                  </div>
                </div>

                <p className="text-xs text-[#B2805E] font-bold leading-relaxed text-center bg-white/50 p-4 rounded-2xl border border-white">
                  まずは3つの質問に答えて、<br/>
                  あなたにぴったりの動物を見つけましょう。
                </p>
              </div>
            </div>

            <div className="w-full mt-6 px-2 relative z-10">
              <button
                onClick={handleStart}
                className="w-full h-16 bg-[#9BC385] text-white rounded-2xl font-bold shadow-xl shadow-[#9BC385]/30 hover:bg-[#9BC385]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span className="text-lg">登録手続きをはじめる</span>
                <ArrowRight size={20} />
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
            className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/60 p-10 space-y-8"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#9BC385] uppercase tracking-widest">Question {currentStep}</p>
                <div className="h-1 w-8 bg-[#9BC385]/20 rounded-full" />
              </div>
              <p className="text-xs font-bold text-[#B2805E]/40 italic">{currentStep} / {QUESTIONS.length}</p>
            </div>

            <h2 className="text-xl font-bold text-[#B2805E] leading-snug min-h-[4rem]">
              {QUESTIONS[currentStep - 1].text}
            </h2>

            <div className="space-y-4">
              {QUESTIONS[currentStep - 1].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.point)}
                  className="w-full p-5 text-left bg-white/50 rounded-[24px] border border-[#B2805E]/10 hover:border-[#9BC385]/30 hover:bg-white hover:shadow-md hover:translate-x-1 transition-all duration-300 group flex items-center gap-5 relative"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#B2805E]/20 flex items-center justify-center text-xs font-black text-[#B2805E]/30 group-hover:border-[#9BC385]/40 group-hover:text-[#9BC385] transition-all duration-300 shadow-sm">
                    {option.id.toUpperCase()}
                  </div>
                  <span className="text-[13px] font-bold text-[#B2805E]/80 group-hover:text-[#B2805E] transition-colors duration-300 flex-1 leading-relaxed">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep > QUESTIONS.length && currentStep <= QUESTIONS.length + 1 && result && (
             <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center space-y-8 max-w-sm bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/60 p-10"
          >
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#E7A950] uppercase tracking-widest">Diagnosis Result</p>
                <h2 className="text-xl font-black text-[#B2805E] italic underline decoration-[#E7A950]/30 decoration-4 underline-offset-4">あなたの姿が見つかりました</h2>
              </div>
              
              <div className="relative inline-block py-4">
                <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden mx-auto drop-shadow-2xl">
                  <img 
                    src={ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].iconUrl} 
                    alt={ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-2 right-0 w-10 h-10 bg-[#E7A950] rounded-full flex items-center justify-center text-white text-xl border-4 border-white shadow-lg z-20"
                >
                  ✓
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-[#B2805E]">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].name}
                </h2>
                <p className="text-xs text-[#B2805E]/70 leading-relaxed px-4 font-medium italic">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].description}
                </p>
              </div>
            </div>

            <div className="p-6 bg-[#9BC385]/5 rounded-[24px] border border-[#9BC385]/10 space-y-4 text-left">
              <p className="text-[9px] text-[#9BC385] font-black uppercase tracking-[0.2em] border-b border-[#9BC385]/10 pb-2 flex items-center gap-2">
                <Award size={12} /> Select Initial Title
              </p>
              <div className="grid grid-cols-1 gap-2">
                {INITIAL_TITLES.map((title) => (
                  <button
                    key={title.id}
                    onClick={() => setSelectedTitle(title.name)}
                    className={`p-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                      selectedTitle === title.name
                        ? "bg-white border-[#9BC385] text-[#9BC385] shadow-md"
                        : "bg-transparent border-transparent text-[#B2805E]/40 hover:text-[#B2805E]/60"
                    }`}
                  >
                    <span>{title.name}</span>
                    {selectedTitle === title.name && <div className="w-1.5 h-1.5 rounded-full bg-[#9BC385]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleFinishDiagnosis}
                className="w-full h-16 bg-[#9BC385] text-white rounded-2xl font-bold shadow-xl shadow-[#9BC385]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                この姿で進む
              </button>
              <button
                onClick={() => setCurrentStep(QUESTIONS.length + 2)}
                className="text-[#B2805E]/40 text-[10px] font-bold uppercase tracking-widest hover:text-[#9BC385] transition-colors"
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
            className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/60 p-10 text-center space-y-8"
          >
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#9BC385] uppercase tracking-widest">Manual Override</p>
              <h2 className="text-lg font-black text-[#B2805E] leading-relaxed">
                あなたが一番しっくりくる姿を<br />
                選んでください
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ANIMAL_RESULTS).map(([id, animal]) => (
                <button
                  key={id}
                  onClick={() => {
                    setResult(id);
                    setTimeout(() => setCurrentStep(QUESTIONS.length + 1), 300);
                  }}
                  className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${
                    result === id 
                      ? "border-[#9BC385] bg-[#9BC385]/5 shadow-inner" 
                      : "border-white bg-white/50 hover:border-[#9BC385]/20 shadow-sm"
                  }`}
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden drop-shadow-lg">
                    <img src={animal.iconUrl} alt={animal.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-[13px] text-[#B2805E] uppercase tracking-tighter">{animal.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(QUESTIONS.length + 1)}
              className="text-[#B2805E]/40 text-[10px] font-bold uppercase tracking-widest hover:text-[#9BC385] transition-colors"
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
            className="relative z-10 text-center space-y-8 w-full max-w-sm bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/60 p-10"
          >
            <div className="space-y-2 text-center">
              <p className="text-[10px] font-black text-[#9BC385] uppercase tracking-widest">Final Step</p>
              <h1 className="text-2xl font-black text-[#B2805E]">お名前の登録</h1>
              <p className="text-[10px] text-[#B2805E]/40 font-bold uppercase tracking-tighter">Enter Your Resident Name</p>
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
                  className={`w-full h-20 px-6 text-center text-3xl font-black bg-white/50 rounded-2xl border-2 transition-all focus:outline-none tracking-widest text-[#B2805E] placeholder:text-[#B2805E]/20 ${
                    nameError ? "border-red-400" : "border-[#B2805E]/10 focus:border-[#9BC385]"
                  }`}
                  autoFocus
                />
                <div className="absolute top-0 left-0 p-3 opacity-10 text-[#B2805E]">
                  < PenTool size={16} />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between px-2 text-[10px] font-black text-[#B2805E]/30 uppercase tracking-widest">
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
            
            <p className="text-[9px] text-[#B2805E]/60 leading-relaxed font-medium bg-white/50 p-4 rounded-xl border border-white">
              ※ひらがな・カタカナ6文字以内で入力してください。この名前は市民名簿に登録され、動物たちの世界での公式な呼び名となります。
            </p>

            <button
              onClick={finishRegistration}
              disabled={isRegistering}
              className="w-full h-16 bg-[#9BC385] text-white rounded-2xl font-bold shadow-xl shadow-[#9BC385]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isRegistering ? "登録中..." : "登録を完了する"}
            </button>
          </motion.div>
        )}

        {isStamping && (
          <motion.div
            key="immigration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-[#9BC385]/20 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            {/* 背景テクスチャの継承 */}
            <div className="absolute inset-0 z-0 opacity-40" 
              style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cream-paper.png')` }} 
            />

            <div className="relative z-10 w-full max-w-[340px] aspect-[3/4] bg-white rounded-[32px] shadow-2xl border border-[#9BC385]/20 overflow-hidden flex flex-col">
              <div className="bg-[#9BC385]/5 px-6 py-4 border-b border-[#9BC385]/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PenTool size={12} className="text-[#9BC385]" />
                  <span className="text-[9px] font-black text-[#9BC385] uppercase tracking-[0.2em]">Final Certification</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#9BC385]/20" />
              </div>
              
              <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8 relative">
                {/* 決定した姿を鮮やかに表示 */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-[#9BC385]/5 flex items-center justify-center shadow-inner relative z-10 overflow-hidden">
                    <img 
                      src={ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.iconUrl} 
                      alt={ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[#9BC385]/10 rounded-full blur-xl"
                  />
                </div>
                
                <div className="space-y-5 w-full">
                  <div className="text-center space-y-1">
                    <p className="text-[8px] text-[#9BC385] font-black uppercase tracking-widest opacity-50 italic">Citizen Name</p>
                    <p className="font-black text-2xl text-[#B2805E] tracking-wider">{userName}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#9BC385]/5">
                    <div className="space-y-1">
                      <p className="text-[8px] text-[#9BC385] font-black uppercase tracking-widest opacity-50">Identity</p>
                      <p className="font-bold text-xs text-[#B2805E]/80">{ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] text-[#9BC385] font-black uppercase tracking-widest opacity-50">Date</p>
                      <p className="font-bold text-xs text-[#B2805E]/80">{new Date().toLocaleDateString()}</p>
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
                      <div className="border-[6px] border-[#E7A950]/60 rounded-2xl px-5 py-2 text-[#E7A950]/60 font-black text-4xl uppercase tracking-tighter transform flex flex-col items-center bg-white/10 backdrop-blur-[2px] shadow-sm">
                        <span className="text-[10px] tracking-[0.3em] mb-1 font-black">Official</span>
                        <span>登録完了</span>
                        <span className="text-[8px] mt-1 font-bold">{new Date().toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="px-6 py-4 bg-[#9BC385]/5 border-t border-[#9BC385]/10 text-center">
                <p className="text-[8px] text-[#9BC385]/60 font-bold italic tracking-widest animate-pulse">
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
                    className="w-1.5 h-1.5 rounded-full bg-[#9BC385]"
                  />
                ))}
              </div>
              <p className="text-[#9BC385] font-black text-[10px] uppercase tracking-[0.4em] mt-2">Processing</p>
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
            className="absolute inset-0 bg-[#9BC385]/40 backdrop-blur-md z-[70] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-[380px] text-center shadow-2xl space-y-8 border-2 border-[#E7A950]"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex justify-center"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white">
                    <img 
                      src={ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].iconUrl} 
                      alt={ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
                <div className="space-y-1">
                  <p className="text-[#9BC385] font-bold text-sm tracking-widest">{selectedTitle}</p>
                  <h2 className="text-3xl font-bold text-[#B2805E]">
                    {userName}さん
                  </h2>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[#B2805E]/80 leading-relaxed font-medium">
                  ようこそ、穏やかな世界へ。<br />
                  まずは賑やかな「街」から、<br />
                  あなたの新しい生活を始めましょう。
                </p>
              </div>

              <button
                onClick={goToForest}
                className="w-full h-16 bg-[#E7A950] text-white rounded-full font-bold shadow-lg shadow-[#E7A950]/30 hover:scale-105 active:scale-95 transition-all"
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
