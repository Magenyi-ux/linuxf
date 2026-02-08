
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
      className="group relative flex flex-col items-start p-6 bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-200 transition-all duration-300 text-left w-full overflow-hidden"
    >
      {/* Decorative background circle */}
      <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full opacity-10 ${colorClass}`} />
      
      {/* Icon with semi-transparent background */}
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-brand-900 mb-4`}>
        <BookOpen className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>

      {/* Exam Title and Description */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{type}</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">{description}</p>
      
      {/* Call to action link */}
      <div className="mt-auto flex items-center text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
        Start Practice
        <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
