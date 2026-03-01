import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-fade-in">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col items-center max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-100">
           <div className="h-full bg-brand-600 animate-progress w-1/3 rounded-full"></div>
        </div>

        <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-100 blur-2xl rounded-full scale-150 opacity-50"></div>
            <div className="bg-brand-50 p-6 rounded-3xl relative">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
            </div>
        </div>

        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Curating Excellence</h3>
        <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">{message}</p>

        <div className="flex items-center gap-2 text-xs font-black text-brand-600 uppercase tracking-widest">
            <span className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></span>
            System AI is working
        </div>
      </div>
    </div>
  );
};