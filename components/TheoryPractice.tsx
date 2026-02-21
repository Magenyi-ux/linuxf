
import React, { useState, useEffect } from 'react';
import { Subject, ExamType } from '../types';
import { ArrowLeft, BookOpen, Send, Loader2, Trophy, HelpCircle, MessageSquare } from 'lucide-react';
import { fetchTheoryQuestion, gradeTheoryAnswer } from '../services/geminiService';
import { MathText } from './MathText';

interface TheoryPracticeProps {
    subject: Subject;
    examType: ExamType;
    onBack: () => void;
}

export const TheoryPractice: React.FC<TheoryPracticeProps> = ({ subject, examType, onBack }) => {
    const [question, setQuestion] = useState<{ text: string; keywords: string[] } | null>(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState(false);
    const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

    useEffect(() => {
        loadQuestion();
    }, []);

    const loadQuestion = async () => {
        setLoading(true);
        setResult(null);
        setAnswer('');
        try {
            const q = await fetchTheoryQuestion(examType, subject);
            setQuestion(q);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim() || !question) return;
        setGrading(true);
        try {
            const res = await gradeTheoryAnswer(question.text, answer, subject);
            setResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setGrading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <button onClick={onBack} className="mb-6 flex items-center text-gray-500 hover:text-brand-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Year Selection
            </button>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-brand-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{subject} Theory</h2>
                            <p className="text-brand-100 text-xs uppercase tracking-wider font-bold">{examType} Practice</p>
                        </div>
                    </div>
                    <button
                        onClick={loadQuestion}
                        disabled={loading || grading}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                        New Question
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
                            <p className="font-medium">AI is generating a theory question...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4" /> The Question
                                </h3>
                                <div className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed">
                                    <MathText text={question?.text || ''} />
                                </div>
                            </div>

                            {!result ? (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Your Answer
                                    </h3>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="Type your detailed explanation here..."
                                        className="w-full h-64 p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all resize-none text-lg"
                                        disabled={grading}
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!answer.trim() || grading}
                                        className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-200 disabled:opacity-50"
                                    >
                                        {grading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                AI is grading your answer...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit for AI Grading
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fade-in-up">
                                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-green-700 font-bold">
                                                <Trophy className="w-5 h-5" />
                                                AI Grade
                                            </div>
                                            <div className="text-3xl font-black text-green-700">
                                                {result.score}<span className="text-sm font-bold opacity-60">/10</span>
                                            </div>
                                        </div>
                                        <div className="text-green-900 leading-relaxed">
                                            <MathText text={result.feedback} />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                                        <h4 className="font-bold text-gray-900 mb-2">Your Answer:</h4>
                                        <p className="text-gray-600 italic whitespace-pre-wrap">{answer}</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                        >
                                            Edit Answer
                                        </button>
                                        <button
                                            onClick={loadQuestion}
                                            className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                                        >
                                            Next Question
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
