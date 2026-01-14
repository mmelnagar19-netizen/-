
import React, { useState, useEffect, useCallback } from 'react';
import { ScreenState, Riddle, Level } from './types';
import { generateLevelRiddles } from './services/geminiService';
import { ProgressBar } from './components/ProgressBar';
import { Trophy, Home, Play, ChevronLeft, Lock, Star, RefreshCw, AlertCircle } from 'lucide-react';

const TOTAL_LEVELS = 500;

const App: React.FC = () => {
  // Game State
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [currentRiddles, setCurrentRiddles] = useState<Riddle[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState('جاري تحضير الألغاز...');
  const [isWrong, setIsWrong] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<number | null>(null);

  // Initialize progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fawazir_progress');
    if (saved) {
      setCompletedLevels(JSON.parse(saved));
    }
  }, []);

  const saveProgress = (level: number) => {
    const updated = Array.from(new Set([...completedLevels, level]));
    setCompletedLevels(updated);
    localStorage.setItem('fawazir_progress', JSON.stringify(updated));
  };

  const startLevel = async (lvl: number) => {
    setCurrentLevel(lvl);
    setScreen('LOADING');
    setLoadingMsg(`جاري إنشاء تحديات المرحلة ${lvl}...`);
    
    const riddles = await generateLevelRiddles(lvl);
    setCurrentRiddles(riddles);
    setCurrentQuestionIdx(0);
    setScore(0);
    setScreen('GAME');
  };

  const handleAnswer = (index: number) => {
    if (isCorrect !== null || isWrong !== null) return;

    const correct = currentRiddles[currentQuestionIdx].correctAnswer;
    if (index === correct) {
      setIsCorrect(index);
      setScore(s => s + 1);
      setTimeout(() => {
        if (currentQuestionIdx < 9) {
          setCurrentQuestionIdx(idx => idx + 1);
          setIsCorrect(null);
        } else {
          finishLevel();
        }
      }, 800);
    } else {
      setIsWrong(index);
      setTimeout(() => {
        setIsWrong(null);
        // In this game, we let them try again or just move on?
        // Let's move on but they need a high score to pass
        if (currentQuestionIdx < 9) {
           setCurrentQuestionIdx(idx => idx + 1);
        } else {
           finishLevel();
        }
      }, 800);
    }
  };

  const finishLevel = () => {
    setScreen('RESULT');
    if (score >= 7) {
      saveProgress(currentLevel);
      // Trigger confetti if using window.confetti
      if ((window as any).confetti) {
        (window as any).confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // --- Screens ---

  const MenuScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-6">
      <div className="mb-8 animate-float">
        <div className="bg-yellow-400 p-6 rounded-full shadow-2xl shadow-yellow-400/20">
          <Trophy size={80} className="text-indigo-900" />
        </div>
      </div>
      <h1 className="text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg">فوازير الذكاء</h1>
      <p className="text-indigo-200 text-lg mb-12 text-center max-w-xs">اختبر ذكاءك مع 500 مرحلة من الألغاز الشيقة والمتدرجة</p>
      
      <button 
        onClick={() => setScreen('LEVEL_SELECT')}
        className="group relative inline-flex items-center justify-center px-12 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 shadow-xl"
      >
        <Play className="ml-2" /> ابدأ اللعب
      </button>

      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur-sm border border-white/10">
          <div className="text-3xl font-bold text-yellow-400">{completedLevels.length}</div>
          <div className="text-xs text-indigo-300 uppercase tracking-widest mt-1">المراحل المكتملة</div>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-center backdrop-blur-sm border border-white/10">
          <div className="text-3xl font-bold text-yellow-400">500</div>
          <div className="text-xs text-indigo-300 uppercase tracking-widest mt-1">إجمالي المراحل</div>
        </div>
      </div>
    </div>
  );

  const LevelSelectScreen = () => (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50/80 backdrop-blur py-2 z-10">
        <button onClick={() => setScreen('MENU')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">اختر المرحلة</h2>
        <div className="w-10"></div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 overflow-y-auto custom-scrollbar flex-grow pb-10">
        {Array.from({ length: TOTAL_LEVELS }).map((_, i) => {
          const lvlNum = i + 1;
          const isUnlocked = lvlNum === 1 || completedLevels.includes(lvlNum - 1);
          const isCompleted = completedLevels.includes(lvlNum);

          return (
            <button
              key={lvlNum}
              disabled={!isUnlocked}
              onClick={() => startLevel(lvlNum)}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center text-lg font-bold transition-all
                ${isUnlocked 
                  ? 'bg-white shadow-md hover:shadow-xl hover:scale-105 border-b-4 border-indigo-200 active:border-b-0 active:translate-y-1' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                ${isCompleted ? 'bg-green-50 border-green-200 text-green-600' : 'text-slate-700'}
              `}
            >
              {isUnlocked ? (
                <>
                  <span>{lvlNum}</span>
                  {isCompleted && <Star size={12} fill="currentColor" className="mt-1" />}
                </>
              ) : (
                <Lock size={20} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-900 text-white p-6">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-indigo-400/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-yellow-400 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="animate-pulse text-yellow-400" />
        </div>
      </div>
      <p className="text-xl font-medium animate-pulse">{loadingMsg}</p>
      <p className="mt-4 text-indigo-300 text-sm">يتم تحضير تجربة ذكاء فريدة لك...</p>
    </div>
  );

  const GameScreen = () => {
    const currentRiddle = currentRiddles[currentQuestionIdx];
    if (!currentRiddle) return null;

    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-indigo-900 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100">
            المرحلة {currentLevel}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setScreen('LEVEL_SELECT')} 
              className="p-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-slate-600"
            >
              <Home size={20} />
            </button>
          </div>
        </div>

        <ProgressBar current={currentQuestionIdx + 1} total={10} />

        <div className="flex-grow flex flex-col justify-center max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-8 shadow-xl border-b-8 border-indigo-200 mb-8 min-h-[200px] flex items-center justify-center text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-relaxed">
              {currentRiddle.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRiddle.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`
                  p-5 rounded-2xl text-lg font-bold text-right transition-all border-b-4
                  ${isCorrect === idx 
                    ? 'bg-green-500 text-white border-green-700 animate-bounce' 
                    : isWrong === idx 
                      ? 'bg-red-500 text-white border-red-700 animate-shake' 
                      : 'bg-white text-slate-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 active:border-b-0 active:translate-y-1 shadow-sm'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-lg text-indigo-600 text-sm ml-3">
                    {['أ', 'ب', 'ج', 'د'][idx]}
                  </span>
                  <span className="flex-grow">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ResultScreen = () => {
    const passed = score >= 7;

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className={`
          mb-8 p-8 rounded-full shadow-2xl
          ${passed ? 'bg-green-500 shadow-green-500/20' : 'bg-red-500 shadow-red-500/20'}
        `}>
          {passed ? <Trophy size={100} /> : <AlertCircle size={100} />}
        </div>

        <h2 className="text-4xl font-black mb-2">
          {passed ? 'أحسنت! تم اجتياز المرحلة' : 'للأسف! لم تنجح هذه المرة'}
        </h2>
        <p className="text-xl text-slate-400 mb-8">
          نتيجتك: {score} من 10
        </p>

        <div className="space-y-4 w-full max-w-xs">
          {passed ? (
            <button 
              onClick={() => startLevel(currentLevel + 1)}
              className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-2xl font-bold text-xl transition-all shadow-lg"
            >
              المرحلة التالية
            </button>
          ) : (
            <button 
              onClick={() => startLevel(currentLevel)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-xl transition-all shadow-lg"
            >
              حاول مرة أخرى
            </button>
          )}

          <button 
            onClick={() => setScreen('LEVEL_SELECT')}
            className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-lg transition-all"
          >
            قائمة المراحل
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="antialiased">
      {screen === 'MENU' && <MenuScreen />}
      {screen === 'LEVEL_SELECT' && <LevelSelectScreen />}
      {screen === 'LOADING' && <LoadingScreen />}
      {screen === 'GAME' && <GameScreen />}
      {screen === 'RESULT' && <ResultScreen />}
    </div>
  );
};

export default App;
