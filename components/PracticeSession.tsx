import React, { useState } from 'react';
import { Question, Subject, ExamType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb, HelpCircle, Search } from 'lucide-react';
import { MathText } from './MathText';

interface PracticeSessionProps {
  questions: Question[];
  sources?: string[];
  examType: ExamType;
  subject: Subject;
  mode: 'STUDY' | 'TEST';
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  questions, sources = [], examType, subject, mode, onFinish, onBack
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    if (answers[currentQuestion.id] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    if (mode === 'STUDY') setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctOptionIndex) score++;
      });
      onFinish(score, totalQuestions);
    }
  };

  const handleInstantExplain = () => {
    if (answers[currentQuestion.id] === undefined) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: -1 }));
      setShowExplanation(true);
    } else {
      setShowExplanation(true);
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;

  const getOptionStyle = (idx: number) => {
    const baseStyle = "w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden";
    if (!isAnswered) return baseStyle + " border-gray-100 hover:border-primary-200 hover:bg-primary-50";
    if (mode === 'TEST') {
      return answers[currentQuestion.id] === idx
        ? baseStyle + " border-primary-500 bg-primary-50 text-primary-900"
        : baseStyle + " border-gray-100 opacity-50";
    }
    if (idx === currentQuestion.correctOptionIndex) return baseStyle + " border-green-500 bg-green-50 text-green-900";
    if (answers[currentQuestion.id] === idx) return baseStyle + " border-red-500 bg-red-50 text-red-900";
    return baseStyle + " border-gray-100 opacity-50";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-24">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button onClick={onBack} className="p-2 sm:p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
            {mode === 'STUDY' ? 'Study Mode' : 'Practice Test'}
          </span>
          <div className="bg-white px-4 py-1 sm:px-5 sm:py-1.5 rounded-full border border-gray-100 shadow-sm font-bold text-gray-900 text-base sm:text-lg">
            {currentIndex + 1} <span className="text-gray-300 mx-1">/</span> {totalQuestions}
          </div>
        </div>
        <div className="w-9 sm:w-12" />
      </div>

      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-5 sm:mb-8 shadow-inner overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mb-5 sm:mb-7 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 leading-snug">
          <MathText text={currentQuestion.text} />
        </h2>
        {currentQuestion.imageUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt={currentQuestion.imageAlt ?? "Question illustration"}
              className="max-h-[180px] sm:max-h-[240px] md:max-h-[300px] object-contain"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionSelect(idx)}
            disabled={isAnswered}
            className={getOptionStyle(idx)}
          >
            <div className="flex items-center gap-3 sm:gap-4 z-10 relative w-full min-w-0">
              <span className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg sm:rounded-xl text-base sm:text-lg font-bold flex-shrink-0 border-2 transition-all ${
                isAnswered && mode === 'STUDY' && idx === currentQuestion.correctOptionIndex ? 'bg-green-600 border-green-600 text-white shadow-md' :
                isAnswered && mode === 'STUDY' && answers[currentQuestion.id] === idx ? 'bg-red-600 border-red-600 text-white shadow-md' :
                isAnswered && mode === 'TEST' && answers[currentQuestion.id] === idx ? 'bg-primary-600 border-primary-600 text-white shadow-md' :
                'bg-gray-50 border-gray-100 text-gray-400 group-hover:border-primary-200 group-hover:text-primary-600'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-base sm:text-lg font-bold text-left flex-1 min-w-0">
                <MathText text={option} />
              </span>
            </div>
            {mode === 'STUDY' && isAnswered && idx === currentQuestion.correctOptionIndex && (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 z-10 shrink-0" />
            )}
            {mode === 'STUDY' && isAnswered && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex && (
              <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary-700 z-10 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {showExplanation && isAnswered && (
        <div className="mb-28 sm:mb-32 animate-fade-in-up">
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 sm:mb-6 relative z-10">
              <div className="bg-primary-600 p-2 sm:p-2.5 rounded-xl shadow-md">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-widest">
                {mode === 'STUDY' ? 'Explanation' : 'Answer Review'}
              </span>
            </div>
            <div className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium relative z-10 mb-5 sm:mb-6">
              <MathText text={currentQuestion.explanation} />
            </div>
            <button
              onClick={() => {
                const event = new CustomEvent('dive-deep', {
                  detail: { context: `Question: ${currentQuestion.text}\nExplanation: ${currentQuestion.explanation}` }
                });
                window.dispatchEvent(event);
              }}
              className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 group text-sm sm:text-base"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Dive Deep & Research
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-3 sm:p-6 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {mode === 'STUDY' && !isAnswered ? (
            <button
              onClick={handleInstantExplain}
              className="flex-1 py-3 sm:py-4 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Reveal Answer
            </button>
          ) : (
            <div className="flex-1 hidden md:block" />
          )}

          {isAnswered ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 sm:py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 text-sm sm:text-base"
            >
              {currentIndex === totalQuestions - 1 ? 'Complete Session' : 'Next Question'}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ) : (
            <div className="text-center text-xs sm:text-sm text-gray-400 font-bold tracking-widest uppercase w-full hidden sm:block">
              Choose an option
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
