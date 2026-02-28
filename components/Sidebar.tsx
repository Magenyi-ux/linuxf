
import React from 'react';
import { Home, Library, Calendar, User, Clock, GraduationCap } from 'lucide-react';
import { ScreenState } from '../types';

interface SidebarProps {
  currentScreen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  packCount: number;
  onShowCountdowns: () => void;
  onShowLibrary: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen, packCount, onShowCountdowns, onShowLibrary }) => {
  const menuItems = [
    { id: 'HOME', label: 'Dashboard', icon: Home },
    { id: 'LIBRARY', label: 'My Library', icon: Library, badge: packCount },
    { id: 'STUDY_PLAN', label: 'Study Plan', icon: Calendar },
    { id: 'PROFILE', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-600 p-2 rounded-xl">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">Exambly</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || (item.id === 'LIBRARY' && false); // Library is a modal usually

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'LIBRARY') {
                  onShowLibrary();
                } else {
                  setScreen(item.id as ScreenState);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-600 font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-brand-100 text-brand-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <button
          onClick={onShowCountdowns}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all"
        >
          <Clock className="w-5 h-5 text-gray-400" />
          <span>Countdowns</span>
        </button>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-4 text-white shadow-lg shadow-brand-200">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Upgrade to Pro</p>
          <p className="text-sm font-medium mb-3">Get unlimited access to all features.</p>
          <button className="w-full bg-white text-brand-600 py-2 rounded-xl text-xs font-bold hover:bg-brand-50 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </aside>
  );
};
