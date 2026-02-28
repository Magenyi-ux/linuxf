
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
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <button onClick={onBack} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Year Selection
            </button>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-brand-900/5 overflow-hidden">
                <div className="bg-brand-600 p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-32 -translate-y-32" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-xl rotate-3">
                            <BookOpen className="w-full h-full" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">{subject} Theory</h2>
                            <p className="text-brand-100 text-sm font-bold uppercase tracking-widest mt-1">{examType} Practice Mode</p>
                        </div>
                    </div>
                    <button
                        onClick={loadQuestion}
                        disabled={loading || grading}
                        className="bg-white text-brand-600 hover:bg-brand-50 px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg relative z-10"
                    >
                        New Question
                    </button>
                </div>

                <div className="p-10">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-gray-400">
                            <div className="relative mb-6">
                                <Loader2 className="w-16 h-16 animate-spin text-brand-500" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-brand-600 rounded-full animate-ping" />
                                </div>
                            </div>
                            <p className="font-bold uppercase tracking-[0.2em] text-xs">AI is generating a practice question...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-12 bg-gray-50 p-8 rounded-[2rem] border border-gray-100 relative group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-600 rounded-full opacity-20" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4" /> The Question
                                </h3>
                                <div className="text-2xl font-extrabold text-gray-900 leading-relaxed">
                                    <MathText text={question?.text || ''} />
                                </div>
                            </div>

                            {!result ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" /> Your Answer
                                        </h3>
                                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-widest">Essay Mode</span>
                                    </div>
                                    <textarea
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="Type your detailed explanation here..."
                                        className="w-full h-80 p-8 bg-white border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none text-lg font-medium shadow-inner"
                                        disabled={grading}
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!answer.trim() || grading}
                                        className="w-full bg-brand-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/20 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        {grading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                AI is grading...
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
                                <div className="animate-fade-in-up space-y-8">
                                    <div className="bg-emerald-50 rounded-[2rem] p-10 border-2 border-emerald-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 opacity-5 rounded-full translate-x-16 -translate-y-16" />
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-100 rounded-xl text-emerald-700 font-black text-xs uppercase tracking-widest">
                                                <Trophy className="w-4 h-4" />
                                                AI Evaluation
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-6xl font-black text-emerald-700">{result.score}</span>
                                                <span className="text-xl font-bold text-emerald-600 opacity-50">/10</span>
                                            </div>
                                        </div>
                                        <div className="text-emerald-900 leading-[1.8] text-lg font-medium relative z-10">
                                            <MathText text={result.feedback} />
                                        </div>
                                    </div>

                                    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Your Submission:</h4>
                                        <p className="text-gray-600 font-medium italic whitespace-pre-wrap leading-relaxed">{answer}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setResult(null)}
                                            className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all"
                                        >
                                            Refine Answer
                                        </button>
                                        <button
                                            onClick={loadQuestion}
                                            className="px-8 py-4 bg-brand-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20"
                                        >
                                            Next Challenge
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
