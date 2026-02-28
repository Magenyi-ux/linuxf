
/**
 * ExamCard.tsx - UI Component for Exam Selection
 * Displays a card representing a specific exam type (JAMB, WAEC, NECO).
 */
import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ExamType } from '../types';

interface ExamCardProps {
  type: ExamType; // The type of exam (JAMB, WAEC, etc.)
  description: string; // Brief description of the exam
  onClick: (type: ExamType) => void; // Callback when the card is clicked
  colorClass: string; // Tailwind CSS class for the background color
}

export const ExamCard: React.FC<ExamCardProps> = ({ type, description, onClick, colorClass }) => {
  return (
    <button
      onClick={() => onClick(type)}
      className="group relative flex flex-col items-start p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-500 transition-all duration-500 text-left w-full overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className={`absolute -bottom-4 -right-4 w-32 h-32 transform rotate-12 rounded-full opacity-5 ${colorClass} group-hover:scale-110 transition-transform duration-700`} />
      
      {/* Icon with semi-transparent background */}
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 mb-6 group-hover:scale-110 transition-transform duration-500`}>
        <BookOpen className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>

      {/* Exam Title and Description */}
      <h3 className="text-xl font-extrabold text-gray-900 mb-2">{type}</h3>
      <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed line-clamp-2">{description}</p>
      
      {/* Call to action link */}
      <div className="mt-auto flex items-center justify-between w-full">
        <span className="text-sm font-bold text-gray-400 group-hover:text-brand-600 transition-colors uppercase tracking-widest">
            Select
        </span>
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
            <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
};
