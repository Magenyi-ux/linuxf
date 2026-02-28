import React from 'react';
import { Subject, ExamType } from '../types';
import { Trophy, RefreshCw, Home, BarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultsProps {
  score: number;
  total: number;
  subject: Subject;
  examType: ExamType;
  onRetry: () => void;
  onHome: () => void;
}

export const Results: React.FC<ResultsProps> = ({ score, total, subject, examType, onRetry, onHome }) => {
  const percentage = Math.round((score / total) * 100);
  
  const data = [
    { name: 'Correct', value: score },
    { name: 'Incorrect', value: total - score },
  ];
  
  const COLORS = ['#10b981', '#ef4444'];

  let message = '';
  let subMessage = '';

  if (percentage >= 80) {
    message = "Outstanding Performance!";
    subMessage = "You are ready for the actual exam.";
  } else if (percentage >= 50) {
    message = "Good Effort!";
    subMessage = "Keep practicing to improve your speed and accuracy.";
  } else {
    message = "Keep Studying";
    subMessage = "Don't give up. Review the explanations and try again.";
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand-900/5 border border-gray-100 overflow-hidden">
        <div className="bg-brand-600 p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-brand-900/20" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl rotate-3">
                    <Trophy className="w-12 h-12 text-yellow-300" />
                </div>
                <h2 className="text-4xl font-black mb-3 tracking-tight">{message}</h2>
                <p className="text-brand-100 font-medium text-lg max-w-md mx-auto">{subMessage}</p>
            </div>
        </div>

        <div className="p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-12">
                <div className="flex-1 text-center lg:text-left space-y-8 w-full">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Session Details</h3>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                             <div className="px-4 py-2 bg-brand-50 rounded-xl text-brand-700 font-bold border border-brand-100">
                                {subject}
                             </div>
                             <div className="px-4 py-2 bg-gray-50 rounded-xl text-gray-600 font-bold border border-gray-100">
                                {examType}
                             </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center lg:items-start group hover:bg-white hover:border-brand-500 transition-all duration-300">
                            <div className="text-4xl font-black text-gray-900 mb-1">{score} <span className="text-gray-300 font-medium">/</span> {total}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correct Answers</div>
                        </div>
                        <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100 flex flex-col items-center lg:items-start group hover:bg-brand-600 hover:text-white transition-all duration-300">
                            <div className="text-4xl font-black text-brand-600 group-hover:text-white mb-1">{percentage}%</div>
                            <div className="text-[10px] font-black text-brand-500 group-hover:text-brand-100 uppercase tracking-widest">Accuracy</div>
                        </div>
                    </div>
                </div>

                <div className="w-64 h-64 relative">
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                        <span className="text-4xl font-black text-gray-900">{percentage}%</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={85}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={10}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-gray-100">
                <button 
                    onClick={onHome}
                    className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                    <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    Back to Dashboard
                </button>
                <button 
                    onClick={onRetry}
                    className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-brand-600 text-white font-black uppercase tracking-widest text-xs hover:bg-brand-700 shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    Practice Again
                </button>
            </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-8">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Correct: {score}</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Incorrect: {total - score}</span>
         </div>
      </div>
    </div>
  );
};