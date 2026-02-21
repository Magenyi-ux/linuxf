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
  onReview: () => void;
  onHome: () => void;
}

export const Results: React.FC<ResultsProps> = ({ score, total, subject, examType, onRetry, onReview, onHome }) => {
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-brand-600 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10 pattern-grid-lg"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-10 h-10 text-yellow-300" />
                </div>
                <h2 className="text-3xl font-bold mb-2">{message}</h2>
                <p className="text-brand-100">{subMessage}</p>
            </div>
        </div>

        <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-1">Subject</h3>
                    <p className="text-xl font-bold text-gray-900 mb-4">{subject} ({examType})</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-2xl font-bold text-gray-900">{score}/{total}</div>
                            <div className="text-xs text-gray-500">Total Score</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="text-2xl font-bold text-brand-600">{percentage}%</div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                        </div>
                    </div>
                </div>

                <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                <button 
                    onClick={onHome}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    <Home className="w-4 h-4" />
                    Home
                </button>
                <button
                    onClick={onReview}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                    <BarChart className="w-4 h-4" />
                    Review Answers
                </button>
                <button 
                    onClick={onRetry}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};