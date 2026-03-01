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
      className="group relative flex flex-col items-start p-6 bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 text-left w-full overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full opacity-10 ${colorClass}`} />
      
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-brand-900 mb-4`}>
        <BookOpen className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{type}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>
      
      <div className="mt-auto flex items-center text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
        Start Practice
        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};