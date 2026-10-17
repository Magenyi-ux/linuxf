import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <main
      className="flex min-h-[70vh] items-center justify-center px-5 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-midnight-900 text-white">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-lg font-semibold tracking-tight text-gray-900">
          Preparing Examply
        </h1>
        <p className="max-w-xs text-sm leading-6 text-gray-500">{message}</p>
      </div>
    </main>
  );
};
