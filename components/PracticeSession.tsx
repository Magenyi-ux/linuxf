
import React, { useState } from 'react';
import { Question, Subject, ExamType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb, HelpCircle } from 'lucide-react';
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
  const [answers, setAnswers] = useState<Record<number, number>>({}); // q.id -> optionIndex
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    if (answers[currentQuestion.id] !== undefined) return; // Prevent changing if already answered

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));

    if (mode === 'STUDY') {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      // Calculate final score
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctOptionIndex) score++;
      });
      onFinish(score, totalQuestions);
    }
  };

  const handleInstantExplain = () => {
      if (answers[currentQuestion.id] === undefined) {
          // Mark as skipped/revealed (-1)
          setAnswers(prev => ({...prev, [currentQuestion.id]: -1}));
          setShowExplanation(true);
      } else {
          setShowExplanation(true);
      }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;
  
  const getOptionStyle = (idx: number) => {
    const baseStyle = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden ";
    
    if (!isAnswered) {
        return baseStyle + "border-gray-100 hover:border-brand-200 hover:bg-brand-50";
    }

    if (mode === 'TEST') {
        return answers[currentQuestion.id] === idx 
            ? baseStyle + "border-brand-500 bg-brand-50 text-brand-900" 
            : baseStyle + "border-gray-100 opacity-50";
    }

    // STUDY MODE logic
    if (idx === currentQuestion.correctOptionIndex) {
        return baseStyle + "border-green-500 bg-green-50 text-green-900"; 
    }
    if (answers[currentQuestion.id] === idx) {
        return baseStyle + "border-red-500 bg-red-50 text-red-900"; 
    }
    return baseStyle + "border-gray-100 opacity-50";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-brand-600 transition-all shadow-sm">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-black text-brand-600 tracking-[0.2em] uppercase mb-1">{mode === 'STUDY' ? 'Study Mode' : 'Practice Test'}</span>
             <div className="bg-white px-5 py-1.5 rounded-full border border-gray-100 shadow-sm font-black text-gray-900 text-lg">
                {currentIndex + 1} <span className="text-gray-300 mx-1">/</span> {totalQuestions}
             </div>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-gray-100 h-3 rounded-full mb-12 shadow-inner overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-600 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question */}
      <div className="mb-12 space-y-4">
        {currentQuestion.instruction && (
            <div className="bg-brand-50/50 p-6 rounded-[32px] border border-brand-100/50">
                <h3 className="text-sm font-black text-brand-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Instructions
                </h3>
                <div className="text-lg font-bold text-gray-700 leading-relaxed italic">
                    <MathText text={currentQuestion.instruction} />
                </div>
            </div>
        )}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                <MathText text={currentQuestion.text} />
            </h2>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-4 mb-12">
        {currentQuestion.options.map((option, idx) => (
            <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={getOptionStyle(idx).replace('rounded-xl', 'rounded-[32px] p-6')}
            >
                <div className="flex items-center gap-6 z-10 relative w-full">
                    <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black flex-shrink-0 border-2 transition-all ${
                        isAnswered && mode === 'STUDY' && idx === currentQuestion.correctOptionIndex ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/30' :
                        isAnswered && mode === 'STUDY' && answers[currentQuestion.id] === idx ? 'bg-accent-600 border-accent-600 text-white shadow-lg shadow-accent-500/30' :
                        isAnswered && mode === 'TEST' && answers[currentQuestion.id] === idx ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30' :
                        'bg-gray-50 border-gray-100 text-gray-400 group-hover:border-brand-200 group-hover:text-brand-600'
                    }`}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xl font-bold text-left flex-1">
                        <MathText text={option} />
                    </span>
                </div>
                
                {mode === 'STUDY' && isAnswered && idx === currentQuestion.correctOptionIndex && (
                    <CheckCircle2 className="w-8 h-8 text-green-600 z-10 shrink-0" />
                )}
                {mode === 'STUDY' && isAnswered && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex && (
                    <XCircle className="w-8 h-8 text-accent-600 z-10 shrink-0" />
                )}
            </button>
        ))}
      </div>

      {/* Explanation Card (Study Mode Only) */}
      {mode === 'STUDY' && showExplanation && (
          <div className="mb-32 animate-fade-in-up">
              <div className="bg-brand-50 rounded-[40px] p-10 border border-brand-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="bg-brand-600 p-2.5 rounded-2xl shadow-lg shadow-brand-500/20">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-black text-brand-900 text-sm uppercase tracking-widest">Master Explanation</span>
                  </div>
                  <div className="text-brand-900 leading-relaxed text-xl font-medium relative z-10">
                      <MathText text={currentQuestion.explanation} />
                  </div>
              </div>
          </div>
      )}

      {sources.length > 0 && (
          <div className="mb-12 p-8 bg-white border border-gray-100 rounded-[32px] text-xs text-gray-400">
              <h4 className="font-black mb-4 uppercase tracking-widest text-gray-900">Reference Sources:</h4>
              <ul className="space-y-2">
                  {sources.map((src, i) => (
                      <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
                          <a href={src} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all font-bold">
                              {src}
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full glass-panel border-t border-gray-100 p-6 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
              {mode === 'STUDY' && !isAnswered ? (
                  <button 
                    onClick={handleInstantExplain}
                    className="flex-1 py-5 bg-gray-50 text-gray-500 font-black rounded-[24px] hover:bg-brand-50 hover:text-brand-600 transition-all flex items-center justify-center gap-3"
                  >
                      <HelpCircle className="w-6 h-6" />
                      REVEAL ANSWER
                  </button>
              ) : (
                  <div className="flex-1 hidden md:block"></div>
              )}

              {isAnswered ? (
                   <button 
                    onClick={handleNext}
                    className="flex-1 py-5 bg-brand-600 text-white font-black rounded-[24px] hover:bg-brand-700 shadow-2xl shadow-brand-500/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                      {currentIndex === totalQuestions - 1 ? 'COMPLETE SESSION' : 'NEXT QUESTION'}
                      <ArrowRight className="w-6 h-6" />
                  </button>
              ) : (
                  <div className="text-center text-sm text-gray-400 font-black tracking-widest uppercase w-full hidden sm:block">
                      CHOOSE AN OPTION
                  </div>
              )}
          </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};
