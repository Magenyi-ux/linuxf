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
      className="group relative flex flex-col items-start p-8 bg-white rounded-2xl border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-200 text-left w-full"
    >
      <div className="flex items-center justify-between w-full mb-6">
        <div className="p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
          <BookOpen className="w-6 h-6" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transform group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{type}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{description}</p>
    </button>
  );
};