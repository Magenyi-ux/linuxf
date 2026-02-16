
/**
 * PracticeSession.tsx - Quiz Engine Component
 * This component manages the state of a practice session (either Study or Test mode).
 * It handles question navigation, answer validation, and score tracking.
 */
import React, { useState } from 'react';
import { Question, Subject, ExamType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb, HelpCircle } from 'lucide-react';
import { MathText } from './MathText';
import { sanitizeUrl } from '../lib/security';

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
    const baseStyle = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden ";
    
    // Default style if not answered
    if (!isAnswered) {
        return baseStyle + "border-gray-100 hover:border-brand-200 hover:bg-brand-50";
    }

    // Styling for TEST mode (only shows selection, not correctness)
    if (mode === 'TEST') {
        return answers[currentQuestion.id] === idx 
            ? baseStyle + "border-brand-500 bg-brand-50 text-brand-900" 
            : baseStyle + "border-gray-100 opacity-50";
    }

    // Styling for STUDY mode (shows Green for correct, Red for incorrect)
    if (idx === currentQuestion.correctOptionIndex) {
        return baseStyle + "border-green-500 bg-green-50 text-green-900"; 
    }
    if (answers[currentQuestion.id] === idx) {
        return baseStyle + "border-red-500 bg-red-50 text-red-900"; 
    }
    return baseStyle + "border-gray-100 opacity-50";
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Header: Progress and Mode indicator */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{mode === 'STUDY' ? 'Study Mode' : 'Test Mode'}</span>
             <span className="text-sm font-bold text-gray-900">{currentIndex + 1} <span className="text-gray-400">/</span> {totalQuestions}</span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8">
        <div className="h-full bg-brand-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question Text Area */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
            <MathText text={currentQuestion.text} />
        </h2>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, idx) => (
            <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={getOptionStyle(idx)}
            >
                <div className="flex items-center gap-4 z-10 relative">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 border ${
                        isAnswered && mode === 'STUDY' && idx === currentQuestion.correctOptionIndex ? 'bg-green-600 border-green-600 text-white' :
                        isAnswered && mode === 'STUDY' && answers[currentQuestion.id] === idx ? 'bg-red-500 border-red-500 text-white' :
                        isAnswered && mode === 'TEST' && answers[currentQuestion.id] === idx ? 'bg-brand-600 border-brand-600 text-white' :
                        'bg-white border-gray-200 text-gray-500'
                    }`}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-lg">
                        <MathText text={option} />
                    </span>
                </div>
                
                {/* Visual feedback icons for STUDY mode */}
                {mode === 'STUDY' && isAnswered && idx === currentQuestion.correctOptionIndex && (
                    <CheckCircle2 className="w-6 h-6 text-green-600 z-10" />
                )}
                {mode === 'STUDY' && isAnswered && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex && (
                    <XCircle className="w-6 h-6 text-red-500 z-10" />
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
                          <a
                            href={sanitizeUrl(src)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline break-all"
                          >
                              {src}
                          </a>
                      </li>
                  ))}
              </ul>
          </div>
      )}

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              {mode === 'STUDY' && !isAnswered ? (
                  <button 
                    onClick={handleInstantExplain}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                      <HelpCircle className="w-5 h-5" />
                      Just Explain It
                  </button>
              ) : (
                  <div className="flex-1"></div>
              )}

              {isAnswered ? (
                   <button 
                    onClick={handleNext}
                    className="flex-1 py-3.5 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
                  >
                      {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next Question'}
                      <ArrowRight className="w-5 h-5" />
                  </button>
              ) : (
                  <div className="text-center text-sm text-gray-400 font-medium w-full hidden sm:block">
                      Select an option to continue
                  </div>
              )}
          </div>
      </div>
      <div className="h-24"></div>
    </div>
  );
};
