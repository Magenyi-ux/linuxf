import React from 'react';
import { Flame, Star, Trophy } from 'lucide-react';
import { UserProfile } from '../types';

interface GamificationBarProps {
    profile: UserProfile;
}

export const GamificationBar: React.FC<GamificationBarProps> = ({ profile }) => {
    const xpForNextLevel = profile.level * 500;
    const progress = Math.min((profile.xp / xpForNextLevel) * 100, 100);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4 shadow-sm group hover:shadow-md transition-all duration-300">
            {/* Level & XP Progress */}
            <div className="flex items-center gap-3 flex-1 min-w-0" title={`Level ${profile.level}`}>
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lvl {profile.level}</span>
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{profile.xp} XP</span>
                    </div>
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Streak Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all ${profile.streak > 0 ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-gray-50 border-transparent text-gray-300'}`}>
                <Flame className={`w-4 h-4 ${profile.streak > 0 ? 'fill-orange-500 text-orange-500 animate-pulse' : ''}`} />
                <span className="text-xs font-black uppercase tracking-tight">{profile.streak} Days</span>
            </div>
        </div>
    );
};