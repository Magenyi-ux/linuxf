import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-fade-in">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
           <div className="h-full bg-primary-600 animate-progress w-1/3 rounded-full"></div>
        </div>

        <div className="relative mb-8">
            <div className="bg-primary-50 p-6 rounded-2xl relative">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Preparing your session</h3>
        <p className="text-base text-gray-500 font-medium leading-relaxed mb-8">{message}</p>

        <div className="flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse"></span>
            Working...
        </div>
      </div>
    </div>
  );
};