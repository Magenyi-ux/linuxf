
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
  const [answers, setAnswers] = useState<Record<string | number, number>>({}); // q.id -> optionIndex
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
        return baseStyle + "border-gray-100 hover:border-primary-200 hover:bg-primary-50";
    }

    if (mode === 'TEST') {
        return answers[currentQuestion.id] === idx 
            ? baseStyle + "border-primary-500 bg-primary-50 text-primary-900"
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
        <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 transition-all">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">{mode === 'STUDY' ? 'Study Mode' : 'Practice Test'}</span>
             <div className="bg-white px-5 py-1.5 rounded-full border border-gray-100 shadow-sm font-bold text-gray-900 text-lg">
                {currentIndex + 1} <span className="text-gray-300 mx-1">/</span> {totalQuestions}
             </div>
        </div>
        <div className="w-12"></div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-gray-100 h-2 rounded-full mb-12 shadow-inner overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question */}
      <div className="mb-12 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-6">
            <MathText text={currentQuestion.text} />
        </h2>
        {currentQuestion.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
                <img
                    src={currentQuestion.imageUrl}
                    alt={currentQuestion.imageAlt ?? "Question illustration"}
                    className="max-h-[300px] object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                    }}
                />
            </div>
        )}
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
                    <span className={`w-12 h-12 flex items-center justify-center rounded-xl text-lg font-bold flex-shrink-0 border-2 transition-all ${
                        isAnswered && mode === 'STUDY' && idx === currentQuestion.correctOptionIndex ? 'bg-green-600 border-green-600 text-white shadow-md' :
                        isAnswered && mode === 'STUDY' && answers[currentQuestion.id] === idx ? 'bg-red-600 border-red-600 text-white shadow-md' :
                        isAnswered && mode === 'TEST' && answers[currentQuestion.id] === idx ? 'bg-primary-600 border-primary-600 text-white shadow-md' :
                        'bg-gray-50 border-gray-100 text-gray-400 group-hover:border-primary-200 group-hover:text-primary-600'
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
                    <XCircle className="w-8 h-8 text-primary-700 z-10 shrink-0" />
                )}
            </button>
        ))}
      </div>

      {/* Explanation Card: shown after every answer in both study and test modes */}
      {showExplanation && isAnswered && (
          <div className="mb-32 animate-fade-in-up">
              <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="bg-primary-600 p-2.5 rounded-xl shadow-md">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-gray-900 text-sm uppercase tracking-widest">{mode === 'STUDY' ? 'Explanation' : 'Answer Review'}</span>
                  </div>
                  <div className="text-gray-700 leading-relaxed text-lg font-medium relative z-10 mb-6">
                      <MathText text={currentQuestion.explanation} />
                  </div>
                  <button
                    onClick={() => {
                        const event = new CustomEvent('dive-deep', {
                            detail: {
                                context: `Question: ${currentQuestion.text}\nExplanation: ${currentQuestion.explanation}`
                            }
                        });
                        window.dispatchEvent(event);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 group"
                  >
                      <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Dive Deep & Research
                  </button>
              </div>
          </div>
      )}

      {sources.length > 0 && (
          <div className="mb-12 p-8 bg-white border border-gray-200 rounded-3xl text-xs text-gray-400">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-gray-900">Sources:</h4>
              <ul className="space-y-2">
                  {sources.map((src, i) => (
                      <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <a href={src} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all font-bold">
                              {src}
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-6 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
              {mode === 'STUDY' && !isAnswered ? (
                  <button 
                    onClick={handleInstantExplain}
                    className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                  >
                      <HelpCircle className="w-6 h-6" />
                      Reveal Answer
                  </button>
              ) : (
                  <div className="flex-1 hidden md:block"></div>
              )}

              {isAnswered ? (
                   <button 
                    onClick={handleNext}
                    className="flex-1 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                      {currentIndex === totalQuestions - 1 ? 'Complete Session' : 'Next Question'}
                      <ArrowRight className="w-6 h-6" />
                  </button>
              ) : (
                  <div className="text-center text-sm text-gray-400 font-bold tracking-widest uppercase w-full hidden sm:block">
                      Choose an option
                  </div>
              )}
          </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};
