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
  
  const COLORS = ['#6366f1', '#f43f5e'];

  let message = '';
  let subMessage = '';

  if (percentage >= 80) {
    message = "Elite Level Mastery!";
    subMessage = "You're crushing this! Perfect for the big day.";
  } else if (percentage >= 50) {
    message = "Solid Foundation!";
    subMessage = "Good job, but we can hit that 90%+ with more focus.";
  } else {
    message = "Mission Underway";
    subMessage = "Growth takes time. Review the AI tips and go again.";
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white rounded-[48px] shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-center mb-6 shadow-2xl border border-white/20 animate-bounce">
                    <Trophy className="w-12 h-12 text-yellow-300 drop-shadow-lg" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">{message}</h2>
                <p className="text-brand-50 text-lg font-medium opacity-90 tracking-wide">{subMessage}</p>
            </div>
        </div>

        <div className="p-10 md:p-14">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border border-gray-100">
                        Performance Breakdown
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-6">{subject} <span className="text-brand-600">({examType})</span></p>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-inner">
                            <div className="text-3xl font-black text-gray-900 mb-1">{score}<span className="text-gray-300 text-xl mx-1">/</span>{total}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Count</div>
                        </div>
                        <div className="bg-brand-50 p-6 rounded-[32px] border border-brand-100 shadow-inner">
                            <div className="text-3xl font-black text-brand-600 mb-1">{percentage}%</div>
                            <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Precision</div>
                        </div>
                    </div>
                </div>

                <div className="w-56 h-56 relative group">
                    <div className="absolute inset-0 bg-brand-100 blur-3xl rounded-full scale-125 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <BarChart className="w-8 h-8 text-brand-600/20" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-gray-100">
                <button 
                    onClick={onHome}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[24px] bg-gray-50 text-gray-500 font-black tracking-widest uppercase text-xs hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
                >
                    <Home className="w-5 h-5" />
                    Dashboard
                </button>
                <button 
                    onClick={onRetry}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-[24px] bg-brand-600 text-white font-black tracking-widest uppercase text-xs hover:bg-brand-700 shadow-[0_20px_40px_rgba(99,102,241,0.3)] transition-all active:scale-95"
                >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};