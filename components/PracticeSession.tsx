
/**
 * PracticeSession.tsx - Quiz Engine Component
 * This component manages the state of a practice session (either Study or Test mode).
 * It handles question navigation, answer validation, and score tracking.
 */
import React, { useState } from 'react';
import { Question, Subject, ExamType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb, HelpCircle, Clock } from 'lucide-react';
import { MathText } from './MathText';

interface PracticeSessionProps {
  questions: Question[]; // Array of questions for the session
  sources?: string[]; // Optional sources for the questions
  examType: ExamType;
  subject: Subject;
  mode: 'STUDY' | 'TEST'; // Determines if feedback is immediate
  onFinish: (score: number, total: number) => void; // Callback when session ends
  onAnswer?: (questionId: number, selectedIndex: number, isCorrect: boolean) => void; // Optional tracking
  onBack: () => void; // Return to previous screen
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({ 
  questions, sources = [], examType, subject, mode, onFinish, onAnswer, onBack
}) => {
  // --- State Hooks ---
  const [currentIndex, setCurrentIndex] = useState(0); // Index of the question currently being shown
  const [answers, setAnswers] = useState<Record<number, number>>({}); // Maps question ID to the index of the selected option
  const [showExplanation, setShowExplanation] = useState(false); // Controls visibility of teacher's explanation

  // --- Derived State ---
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100; // Percentage completion
  const isAnswered = answers[currentQuestion.id] !== undefined; // Has the current question been answered?

  /**
   * Handles user selection of an answer option.
   */
  const handleOptionSelect = (optionIndex: number) => {
    // Prevent re-answering a question that's already been answered
    if (answers[currentQuestion.id] !== undefined) return;

    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;

    // Record the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));

    // Trigger external tracking if provided
    if (onAnswer) {
        onAnswer(currentQuestion.id, optionIndex, isCorrect);
    }

    // In STUDY mode, show the explanation immediately after an answer is selected
    if (mode === 'STUDY') {
      setShowExplanation(true);
    }
  };

  /**
   * Navigates to the next question or finishes the session if on the last question.
   */
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      // Calculate final score by comparing answers to correct indices
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctOptionIndex) score++;
      });
      onFinish(score, totalQuestions);
    }
  };

  /**
   * Reveals the explanation without requiring the user to select an answer first.
   * Useful when the user is stuck.
   */
  const handleInstantExplain = () => {
      if (answers[currentQuestion.id] === undefined) {
          // Mark as skipped/revealed (-1) to lock the question
          setAnswers(prev => ({...prev, [currentQuestion.id]: -1}));

          if (onAnswer) {
              onAnswer(currentQuestion.id, -1, false);
          }
      }
      setShowExplanation(true);
  };
  
  /**
   * Helper to determine the CSS styling for an option based on the current state.
   */
  const getOptionStyle = (idx: number) => {
    const baseStyle = "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden ";
    
    // Default style if not answered
    if (!isAnswered) {
        return baseStyle + "border-gray-50 bg-white hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-0.5";
    }

    // Styling for TEST mode (only shows selection, not correctness)
    if (mode === 'TEST') {
        return answers[currentQuestion.id] === idx 
            ? baseStyle + "border-brand-600 bg-brand-50 text-brand-900 shadow-md shadow-brand-100"
            : baseStyle + "border-transparent bg-gray-50 opacity-40";
    }

    // Styling for STUDY mode (shows Green for correct, Red for incorrect)
    if (idx === currentQuestion.correctOptionIndex) {
        return baseStyle + "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-100";
    }
    if (answers[currentQuestion.id] === idx) {
        return baseStyle + "border-red-500 bg-red-50 text-red-900 shadow-md shadow-red-100";
    }
    return baseStyle + "border-transparent bg-gray-50 opacity-40";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-32">
      {/* Header: Progress and Mode indicator */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline uppercase tracking-widest">Exit</span>
        </button>
        <div className="flex flex-col items-center gap-1">
             <div className="px-3 py-1 bg-brand-50 rounded-full border border-brand-100">
                <span className="text-[10px] font-extrabold text-brand-600 tracking-widest uppercase">{mode === 'STUDY' ? 'Study Mode' : 'Test Mode'}</span>
             </div>
             <span className="text-xl font-black text-gray-900">{currentIndex + 1} <span className="text-gray-300 font-medium">/</span> {totalQuestions}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest">24:59</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full mb-12 overflow-hidden border border-gray-50">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question Text Area */}
      <div className="mb-12 bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-600 opacity-20" />
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-[1.4]">
            <MathText text={currentQuestion.text} />
        </h2>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {currentQuestion.options.map((option, idx) => (
            <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={getOptionStyle(idx)}
            >
                <div className="flex items-center gap-5 z-10 relative">
                    <span className={`w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black flex-shrink-0 transition-all duration-300 ${
                        isAnswered && mode === 'STUDY' && idx === currentQuestion.correctOptionIndex ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110' :
                        isAnswered && mode === 'STUDY' && answers[currentQuestion.id] === idx ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-110' :
                        isAnswered && mode === 'TEST' && answers[currentQuestion.id] === idx ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-110' :
                        'bg-gray-50 text-gray-400 group-hover:bg-brand-600 group-hover:text-white'
                    }`}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg font-bold">
                        <MathText text={option} />
                    </span>
                </div>
                
                {/* Visual feedback icons for STUDY mode */}
                {mode === 'STUDY' && isAnswered && idx === currentQuestion.correctOptionIndex && (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                )}
                {mode === 'STUDY' && isAnswered && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex && (
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <XCircle className="w-6 h-6" />
                    </div>
                )}
            </button>
        ))}
      </div>

      {/* Teacher's Explanation (Study Mode Only) */}
      {mode === 'STUDY' && showExplanation && (
          <div className="mb-24 animate-fade-in-up">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-100 p-1.5 rounded-lg">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-bold text-blue-900 text-sm uppercase">Teacher's Explanation</span>
                  </div>
                  <div className="text-blue-900 leading-relaxed text-base">
                      <MathText text={currentQuestion.explanation} />
                  </div>
              </div>
          </div>
      )}

      {/* Sources list for grounded questions */}
      {sources.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
              <h4 className="font-semibold mb-2">Sources:</h4>
              <ul className="list-disc pl-4 space-y-1">
                  {sources.map((src, i) => (
                      <li key={i}>
                          <a href={src} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">
                              {src}
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 z-40 pb-safe shadow-2xl shadow-black/5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
              {mode === 'STUDY' && !isAnswered ? (
                  <button 
                    onClick={handleInstantExplain}
                    className="px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 border border-gray-100 transition-all flex items-center justify-center gap-2"
                  >
                      <HelpCircle className="w-5 h-5" />
                      <span className="hidden sm:inline">Just Explain It</span>
                  </button>
              ) : (
                  <div className="hidden sm:block">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {totalQuestions}</span>
                  </div>
              )}

              {isAnswered ? (
                   <button 
                    onClick={handleNext}
                    className="flex-1 sm:flex-none px-12 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                  >
                      {currentIndex === totalQuestions - 1 ? 'Finish Session' : 'Continue'}
                      <ArrowRight className="w-6 h-6" />
                  </button>
              ) : (
                  <div className="text-center text-sm text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 flex-1">
                      Choose an option to unlock next
                  </div>
              )}
          </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};
