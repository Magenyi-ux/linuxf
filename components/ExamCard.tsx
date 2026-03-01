import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ExamType } from '../types';

interface ExamCardProps {
  type: ExamType;
  description: string;
  onClick: (type: ExamType) => void;
  colorClass: string;
}

export const ExamCard: React.FC<ExamCardProps> = ({ type, description, onClick, colorClass }) => {
  return (
    <button
      onClick={() => onClick(type)}
      className="group relative flex flex-col items-start p-8 bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 border border-gray-100 transition-all duration-300 text-left w-full overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 w-32 h-32 transform rounded-full opacity-10 ${colorClass} blur-2xl group-hover:opacity-20 transition-opacity`} />
      
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 text-brand-900 mb-6 group-hover:scale-110 transition-transform`}>
        <BookOpen className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
      </div>

      <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">{type}</h3>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">{description}</p>
      
      <div className="mt-auto flex items-center gap-2 text-sm font-bold text-brand-600">
        <span className="bg-brand-50 px-4 py-2 rounded-full group-hover:bg-brand-600 group-hover:text-white transition-all">
          Select Exam
        </span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};