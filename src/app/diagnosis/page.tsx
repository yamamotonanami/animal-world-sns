"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Coffee, Cloud, Moon, Sun, Heart } from "lucide-react";
import { ANIMAL_DATA } from "@/lib/constants";

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

export default function DiagnosisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0: start, 1-3: questions, 4: result
  const [scores, setScores] = useState({ dog: 0, cat: 0, rabbit: 0, beaver: 0 });
  const [result, setResult] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("ふわふわの新参者");
  const [userName, setUserName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  const INITIAL_TITLES = [
    "ふわふわの新参者",
    "ぴかぴかの新入り肉球",
    "震えるしっぽの冒険家",
  ];

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
      // 結果を計算
      const winner = Object.entries(newScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      setResult(winner);
      setCurrentStep(QUESTIONS.length + 1);
    }
  };

  const handleFinishDiagnosis = () => {
    setCurrentStep(QUESTIONS.length + 3); // 名前入力ステップへ
  };

  const finishRegistration = () => {
    // 決定ボタンを押したタイミングでバリデーション
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
    setIsWelcomeModalOpen(true);
  };

  const goToForest = () => {
    // ユーザー情報を保存
    if (result && userName) {
      localStorage.setItem("animal_sns_user", JSON.stringify({
        name: userName,
        animal: result,
        title: selectedTitle
      }));
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
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <div className="w-24 h-24 bg-sage/20 rounded-full flex items-center justify-center mx-auto text-4xl">
                ✨
              </div>
              <h1 className="text-2xl font-bold text-sage">動物診断</h1>
              <p className="text-zinc-500 leading-relaxed">
                あなたの心の波長に合う<br />
                森の姿をみつけましょう。
              </p>
            </div>
            <button
              onClick={handleStart}
              className="w-64 h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-105 active:scale-95 transition-all"
            >
              はじめる
            </button>
          </motion.div>
        )}

        {currentStep >= 1 && currentStep <= QUESTIONS.length && (
          <motion.div
            key={`q-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm space-y-8"
          >
            <div className="space-y-2">
              <p className="text-sage font-bold text-sm uppercase tracking-widest">
                Question {currentStep} / {QUESTIONS.length}
              </p>
              <h2 className="text-xl font-bold leading-tight">
                {QUESTIONS[currentStep - 1].text}
              </h2>
            </div>

            <div className="space-y-4">
              {QUESTIONS[currentStep - 1].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.point)}
                  className="w-full p-5 text-left bg-white rounded-2xl border border-sage/10 hover:border-sage shadow-sm hover:shadow-md transition-all group"
                >
                  <span className="text-zinc-600 group-hover:text-sage transition-colors">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep > QUESTIONS.length && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-sm"
          >
            <div className="space-y-4">
              <p className="text-sage font-bold tracking-widest uppercase text-sm">診断結果</p>
              <div className="text-7xl mb-4">{ANIMAL_RESULTS[result].emoji}</div>
              <h2 className="text-3xl font-bold text-zinc-800">
                あなたは「{ANIMAL_RESULTS[result].name}」
              </h2>
              <p className="text-zinc-500 leading-relaxed">
                {ANIMAL_RESULTS[result].description}
              </p>
            </div>

            <div className="p-6 bg-sage/5 rounded-3xl border border-sage/10 space-y-4 text-left">
              <p className="text-xs text-sage font-bold text-center uppercase tracking-widest">
                あなたの二つ名（初期称号）
              </p>
              <div className="flex flex-col gap-2">
                {INITIAL_TITLES.map((title) => (
                  <button
                    key={title}
                    onClick={() => setSelectedTitle(title)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border ${
                      selectedTitle === title
                        ? "bg-white border-sage text-sage shadow-sm scale-[1.02]"
                        : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleFinishDiagnosis}
                className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-105 active:scale-95 transition-all"
              >
                この姿で森に入る
              </button>
              <button
                onClick={() => setCurrentStep(QUESTIONS.length + 2)}
                className="w-full h-14 text-zinc-400 font-medium hover:text-sage transition-colors"
              >
                自分で他の動物を選ぶ
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === QUESTIONS.length + 2 && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 w-full max-w-sm"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-800">どの姿になりますか？</h2>
              <p className="text-zinc-500">あなたが一番しっくりくる姿を選んでね。</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(ANIMAL_RESULTS).map(([id, animal]) => (
                <button
                  key={id}
                  onClick={() => {
                    setResult(id);
                    // 選択したら少し間を置いてから名前入力へ
                    setTimeout(handleFinishDiagnosis, 300);
                  }}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    result === id 
                      ? "border-sage bg-sage/5 shadow-inner" 
                      : "border-sage/10 bg-white hover:border-sage/30 shadow-sm"
                  }`}
                >
                  <span className="text-4xl">{animal.emoji}</span>
                  <span className="font-bold text-zinc-700">{animal.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(QUESTIONS.length + 1)}
              className="text-zinc-400 hover:text-sage transition-colors"
            >
              診断結果に戻る
            </button>
          </motion.div>
        )}

        {currentStep === QUESTIONS.length + 3 && (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 w-full max-w-sm"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-800">森での呼び名は？</h2>
              <p className="text-zinc-500">ひらがな・カタカナ6文字以内で教えてね。</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                  if (nameError) setNameError(null); // 入力し始めたらエラーを消す
                }}
                placeholder="なまえを入力"
                className={`w-full h-16 px-6 text-center text-xl font-bold bg-white rounded-2xl border-2 transition-all focus:outline-none ${
                  nameError ? "border-red-400" : "border-sage/20 focus:border-sage"
                }`}
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <div className="flex justify-between px-2 text-[10px] font-bold text-sage/40 uppercase tracking-widest">
                  <span>{selectedTitle}</span>
                  <span>{userName.length} / 6</span>
                </div>
                <AnimatePresence>
                  {nameError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] text-red-400 font-bold"
                    >
                      {nameError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={finishRegistration}
              className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-105 active:scale-95 transition-all"
            >
              決定する
            </button>

            <button
              onClick={() => setCurrentStep(QUESTIONS.length + 1)}
              className="text-zinc-400 hover:text-sage transition-colors"
            >
              やり直す
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ウェルカムモーダル */}
      <AnimatePresence>
        {isWelcomeModalOpen && result && (
          <>
            <motion.div
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
                    {ANIMAL_RESULTS[result].emoji}
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
                    ようこそ、穏やかな森へ。<br />
                    ここでは人間の言葉を脱ぎ捨てて、<br />
                    あなたのままに過ごしてください。
                  </p>
                </div>

                <button
                  onClick={goToForest}
                  className="w-full h-16 bg-sage text-white rounded-full font-bold shadow-lg shadow-sage/30 hover:scale-105 active:scale-95 transition-all"
                >
                  森へすすむ
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
