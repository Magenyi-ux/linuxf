
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
    <div className="fixed inset-0 bg-[#fafafa] z-[60] flex flex-col animate-scale-in">
      {/* App-style Practice Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <XCircle className="w-6 h-6 text-gray-400" />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-black text-brand-600 tracking-widest uppercase">{mode} MODE</span>
             <div className="font-black text-gray-900">
                {currentIndex + 1} of {totalQuestions}
             </div>
        </div>
        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-black text-xs">
            {Math.round(progress)}%
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
            {/* Progress Bar - Minimal */}
            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Question Card */}
            <div className="mb-8">
                <div className="text-xl font-bold text-gray-900 leading-relaxed bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <MathText text={currentQuestion.text} />
                </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 mb-10">
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
            <div className="h-32"></div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 p-6 pb-safe">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              {mode === 'STUDY' && !isAnswered ? (
                  <button 
                    onClick={handleInstantExplain}
                    className="flex-1 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl flex items-center justify-center gap-2"
                  >
                      REVEAL
                  </button>
              ) : null}

              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className={`flex-[2] py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 ${
                    isAnswered
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-gray-100 text-gray-300'
                }`}
              >
                  {currentIndex === totalQuestions - 1 ? 'FINISH' : 'CONTINUE'}
                  <ArrowRight className="w-5 h-5" />
              </button>
          </div>
      </div>
    </div>
  );
};
