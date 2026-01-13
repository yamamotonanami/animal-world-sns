"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Coffee, Cloud, Moon, Sun, Heart, Award } from "lucide-react";
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

// Get Title ID map
// Note: In real app, we should fetch titles from DB.
// For now, map static titles to IDs if we have a way.
// Our titles.ts defines them. But the DB IDs are UUIDs.
// We should probably rely on the names for now or assume seeding created them?
// Or just store the name in `current_title_id` if we change schema to text? No, it's UUID.
// For Phase 10 integration, we should insert titles into DB if they don't exist?
// Or update `registerUser` to lookup title by name.
// I will update `registerUser` logic in `src/app/actions/user.ts` to lookup title by name.
// But first, let's keep the client logic.

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
    
    // Call Server Action
    try {
        // Need to map title name to ID?
        // For MVP, we pass the title NAME? No, `registerUser` expects titleId.
        // We haven't seeded titles, so we can't get ID easily.
        // I will modify `registerUser` to accept title NAME and animal type NAME (or ID 'dog').
        // `registerUser` in `actions/user.ts` currently expects UUIDs.
        // This is a blocker.
        // I should update `registerUser` to handle lookups or upserts of titles/animal_types.
        // Or I should Seed the DB.
        // I'll update `registerUser` to lookup or create titles on the fly for simplicity?
        // Or I'll just pass a placeholder UUID for now if I can't look it up.
        // Wait, `animalTypeId` is 'dog', 'cat' in the app constants. In DB it is UUID.
        // I need to seed `animal_types` and `titles` to make this work.
        // I should create a seeding script or Server Action to seed if empty.
        // Or `registerUser` can handle "if UUID provided, use it. If string 'dog', lookup".
        
        // Let's assume for now I will update `registerUser` to handle string IDs (lookup).
        // I'll use the 'dog', 'cat' keys as lookups.
        
        await registerUser(userName, result!, selectedTitle);
        
        // Success
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
    // LocalStorage fallback for optimistic UI in other parts
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
    <div className="min-h-screen bg-offwhite flex flex-col items-center justify-center p-6 text-zinc-800">
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 bg-white p-12 rounded-[40px] shadow-2xl border-2 border-sage/10 max-w-sm w-full relative overflow-hidden"
          >
             {/* ... (Keep existing UI) ... */}
            <div className="absolute top-0 left-0 w-full h-2 bg-sage/20" />
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <span className="text-4xl font-black">ENTRY</span>
            </div>

            <div className="space-y-6">
              <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto border-2 border-sage/20 shadow-inner">
                <span className="text-3xl">📝</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-sage tracking-tighter italic">RESIDENT REGISTRATION</h1>
                <p className="text-[10px] font-bold text-sage/40 uppercase tracking-[0.3em]">住人登録</p>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                ようこそ、動物たちの世界へ。<br />
                これから住人登録を行います。<br />
                あなたについて教えてください。
              </p>
            </div>
            
            <button
              onClick={handleStart}
              className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              登録を開始する
              <span className="text-xs opacity-50 font-normal">Start Registration</span>
            </button>
            
            <p className="text-[10px] text-zinc-300">※所要時間：約1分</p>
          </motion.div>
        )}

        {currentStep >= 1 && currentStep <= QUESTIONS.length && (
             // ... (Keep existing UI for Questions) ...
            <motion.div
            key={`q-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm bg-white p-10 rounded-[40px] shadow-2xl border-2 border-sage/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-sage/20" />
            
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-sage/40 uppercase tracking-widest">Section {currentStep}</p>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Psychological Scan</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-sage italic">{currentStep} / {QUESTIONS.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold leading-snug text-zinc-700 min-h-[3.5rem] flex items-center">
                  {QUESTIONS[currentStep - 1].text}
                </h2>
              </div>

              <div className="space-y-3">
                {QUESTIONS[currentStep - 1].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.point)}
                    className="w-full p-5 text-left bg-zinc-50 rounded-2xl border border-transparent hover:border-sage/30 hover:bg-white hover:shadow-lg transition-all group flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full border border-sage/20 flex items-center justify-center text-[10px] font-bold text-sage/40 group-hover:bg-sage group-hover:text-white group-hover:border-sage transition-all">
                      {option.id.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-800 transition-colors flex-1">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-center">
              <div className="flex gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all ${i + 1 === currentStep ? "w-6 bg-sage" : "w-2 bg-sage/10"}`} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {currentStep > QUESTIONS.length && currentStep <= QUESTIONS.length + 1 && result && (
            // ... (Keep existing UI for Result) ...
             <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-sm bg-white p-10 rounded-[40px] shadow-2xl border-2 border-sage/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-sage/20" />
            
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-sage/40 uppercase tracking-widest">Classification Result</p>
                <h2 className="text-xl font-black text-zinc-700 italic">PERSONA IDENTIFIED</h2>
              </div>
              
              <div className="relative inline-block">
                <div className="text-7xl mb-4 relative z-10">{ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].emoji}</div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-mustard rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-lg z-20"
                >
                  ✔
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-800">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].name}
                </h2>
                <div className="w-12 h-0.5 bg-sage/20 mx-auto" />
                <p className="text-zinc-500 text-xs leading-relaxed px-4">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS].description}
                </p>
              </div>
            </div>

            <div className="p-6 bg-sage/5 rounded-3xl border border-sage/10 space-y-4 text-left relative">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Award size={24} />
              </div>
              <p className="text-[10px] text-sage font-black uppercase tracking-[0.2em] mb-2 border-b border-sage/10 pb-1">
                Initial Title Selection
              </p>
              <div className="flex flex-col gap-2">
                {INITIAL_TITLES.map((title) => (
                  <button
                    key={title.id}
                    onClick={() => setSelectedTitle(title.name)}
                    className={`p-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between ${
                      selectedTitle === title.name
                        ? "bg-white border-sage text-sage shadow-md translate-x-1"
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
                className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                この姿で進む
                <span className="text-[10px] opacity-50 font-normal italic">Accept Identity</span>
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
             // ... (Keep existing UI for Selection) ...
             <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 w-full max-w-sm bg-white p-10 rounded-[40px] shadow-2xl border-2 border-sage/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-sage/20" />
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-sage/40 uppercase tracking-widest">Manual Override</p>
              <h2 className="text-xl font-black text-zinc-700 italic">CHOOSE IDENTITY</h2>
              <p className="text-zinc-400 text-[10px] uppercase font-bold">あなたが一番しっくりくる姿を選んでください。</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(ANIMAL_RESULTS).map(([id, animal]) => (
                <button
                  key={id}
                  onClick={() => {
                    setResult(id);
                    setTimeout(handleFinishDiagnosis, 300);
                  }}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    result === id 
                      ? "border-sage bg-sage/5 shadow-inner" 
                      : "border-zinc-100 bg-white hover:border-sage/30 shadow-sm"
                  }`}
                >
                  <span className="text-4xl">{animal.emoji}</span>
                  <span className="font-bold text-xs text-zinc-700 uppercase tracking-tighter">{animal.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(QUESTIONS.length + 1)}
              className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-sage transition-colors border-b border-zinc-100 pb-1"
            >
              診断結果に戻る / Return to Result
            </button>
          </motion.div>
        )}

        {currentStep === QUESTIONS.length + 3 && (
            // ... (Keep existing UI for Name Input) ...
            <motion.div
            key="name-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 w-full max-w-sm bg-white p-10 rounded-[40px] shadow-2xl border-2 border-sage/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-sage/20" />
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-sage/40 uppercase tracking-widest">Final Step</p>
              <h2 className="text-xl font-black text-zinc-700 italic">REGISTRATION</h2>
              <p className="text-zinc-400 text-[10px] uppercase font-bold">世界での呼び名を決定します。</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (nameError) setNameError(null);
                  }}
                  placeholder="NAME"
                  className={`w-full h-20 px-6 text-center text-2xl font-black bg-zinc-50 rounded-2xl border-2 transition-all focus:outline-none tracking-widest ${
                    nameError ? "border-red-400" : "border-sage/20 focus:border-sage"
                  }`}
                  autoFocus
                />
                <div className="absolute top-0 left-0 p-2 opacity-5">
                  <span className="text-[8px] font-black uppercase">Official Use Only</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between px-2 text-[10px] font-black text-sage/40 uppercase tracking-widest italic">
                  <span>{selectedTitle}</span>
                  <span>{userName.length} / 6</span>
                </div>
                <AnimatePresence>
                  {nameError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-red-400 font-bold uppercase"
                    >
                      {nameError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="p-4 bg-sage/5 rounded-2xl border border-sage/10 text-left">
              <p className="text-[9px] text-zinc-400 leading-relaxed font-medium italic">
                ※ひらがな・カタカナ6文字以内で入力してください。この名前は市民名簿に登録され、変更には再登録が必要となります。
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={finishRegistration}
                disabled={isRegistering}
                className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? "登録中..." : "登録を完了する"}
                <span className="text-[10px] opacity-50 font-normal italic">Finalize</span>
              </button>

              <button
                onClick={() => setCurrentStep(QUESTIONS.length + 1)}
                className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-sage transition-colors"
              >
                やり直す / Back
              </button>
            </div>
          </motion.div>
        )}

        {isStamping && (
            // ... (Keep existing UI for Stamp) ...
             <motion.div
            key="immigration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-offwhite flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-[340px] aspect-[3/4] bg-white rounded-2xl shadow-2xl border-2 border-sage/10 overflow-hidden flex flex-col relative">
              <div className="bg-sage/10 p-4 border-b border-sage/10 flex justify-between items-center">
                <span className="text-[10px] font-black text-sage uppercase tracking-[0.3em]">Resident Card / 住人登録証</span>
                <div className="w-2 h-2 rounded-full bg-sage/20" />
              </div>
              
              <div className="flex-1 p-8 flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 rounded-full bg-sage/5 flex items-center justify-center text-5xl grayscale opacity-50">
                  {ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.emoji}
                </div>
                
                <div className="space-y-4 w-full text-center">
                  <div className="space-y-1 border-b border-sage/5 pb-2">
                    <p className="text-[8px] text-sage/40 uppercase font-bold tracking-widest">Name</p>
                    <p className="font-bold text-lg text-zinc-400">{userName}</p>
                  </div>
                  <div className="space-y-1 border-b border-sage/5 pb-2">
                    <p className="text-[8px] text-sage/40 uppercase font-bold tracking-widest">Animal Identity</p>
                    <p className="font-bold text-sm text-zinc-400">{ANIMAL_RESULTS[result as keyof typeof ANIMAL_RESULTS]?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] text-sage/40 uppercase font-bold tracking-widest">Registration Date</p>
                    <p className="font-bold text-xs text-zinc-400">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showStamp && (
                  <motion.div
                    initial={{ scale: 3, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: -15 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className="border-4 border-sage/60 rounded-xl px-4 py-2 text-sage/60 font-black text-3xl uppercase tracking-tighter transform -rotate-12 flex flex-col items-center shadow-lg bg-white/10 backdrop-blur-[1px]">
                      <span className="text-[10px] tracking-widest mb-1">Registered</span>
                      <span>登録完了</span>
                      <span className="text-[8px] mt-1">{new Date().toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="p-4 bg-sage/5 text-center">
                <p className="text-[8px] text-sage/40 font-medium italic">Synchronizing resident data... Done.</p>
              </div>
            </div>
            <p className="mt-8 text-sage font-bold text-sm animate-pulse">住人登録中...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWelcomeModalOpen && result && (
            // ... (Keep existing UI for Welcome) ...
            <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sage/40 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 w-full max-w-[380px] text-center shadow-2xl space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
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
