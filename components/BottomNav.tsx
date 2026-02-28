
import React from 'react';
import { Home, Library, Calendar, User, MessageSquare } from 'lucide-react';
import { ScreenState } from '../types';

interface BottomNavProps {
  currentScreen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  onShowLibrary: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen, onShowLibrary }) => {
  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'LIBRARY', label: 'Library', icon: Library, action: onShowLibrary },
    { id: 'STUDY_PLAN', label: 'Plan', icon: Calendar },
    { id: 'PROFILE', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-100 h-16 flex items-center justify-around px-4 z-40 pb-safe shadow-lg shadow-black/10">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                setScreen(item.id as ScreenState);
              }
            }}
            className="flex flex-col items-center justify-center w-16 h-full gap-1 transition-all"
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600 fill-brand-50' : 'text-gray-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
