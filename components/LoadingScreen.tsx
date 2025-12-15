import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center max-w-md w-full">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Please Wait</h3>
        <p className="text-gray-500">{message}</p>
        <div className="w-full bg-gray-200 h-1.5 mt-6 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 animate-progress w-2/3 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};