
import React from 'react';
import { Question, Subject, ExamType } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react';
import { MathText } from './MathText';

interface ReviewAnswersProps {
    questions: Question[];
    userAnswers: Record<number, number>;
    subject: Subject;
    examType: ExamType;
    onBack: () => void;
}

export const ReviewAnswers: React.FC<ReviewAnswersProps> = ({
    questions, userAnswers, subject, examType, onBack
}) => {
    return (
        <div className="max-w-3xl mx-auto px-4 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="flex items-center text-gray-500 hover:text-brand-600 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Results
                </button>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900">Review Answers</h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{subject} • {examType}</p>
                </div>
            </div>

            <div className="space-y-8 pb-20">
                {questions.map((q, qIdx) => {
                    const userAnswer = userAnswers[q.id];
                    const isCorrect = userAnswer === q.correctOptionIndex;

                    return (
                        <div key={q.id} className={`p-6 rounded-2xl border bg-white transition-all ${isCorrect ? 'border-gray-100' : 'border-red-100 shadow-sm'}`}>
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                                    isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {qIdx + 1}
                                </div>
                                <div className="text-lg font-medium text-gray-900 leading-relaxed">
                                    <MathText text={q.text} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 mb-4">
                                {q.options.map((opt, oIdx) => {
                                    const isUserChoice = userAnswer === oIdx;
                                    const isCorrectChoice = q.correctOptionIndex === oIdx;

                                    let style = "flex items-center gap-3 p-3 rounded-xl border text-sm transition-all ";
                                    if (isCorrectChoice) {
                                        style += "bg-green-50 border-green-200 text-green-900 font-medium";
                                    } else if (isUserChoice && !isCorrect) {
                                        style += "bg-red-50 border-red-200 text-red-900 font-medium";
                                    } else {
                                        style += "bg-gray-50 border-gray-100 text-gray-600 opacity-60";
                                    }

                                    return (
                                        <div key={oIdx} className={style}>
                                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${
                                                isCorrectChoice ? 'bg-green-600 border-green-600 text-white' :
                                                isUserChoice ? 'bg-red-500 border-red-500 text-white' :
                                                'bg-white border-gray-200 text-gray-400'
                                            }`}>
                                                {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <div className="flex-1">
                                                <MathText text={opt} />
                                            </div>
                                            {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                            {isUserChoice && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-4 h-4 text-brand-600" />
                                    <span className="text-xs font-bold text-brand-700 uppercase">Explanation</span>
                                </div>
                                <div className="text-sm text-brand-900 leading-relaxed">
                                    <MathText text={q.explanation} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
