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
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shadow-sm sticky top-16 z-40">
            {/* Level */}
            <div className="flex items-center gap-2" title={`Level ${profile.level}`}>
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-300">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 uppercase">Lvl {profile.level}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-brand-500 fill-brand-500" />
                <span className="text-sm font-bold text-gray-700">{profile.xp} <span className="text-xs font-normal text-gray-500">XP</span></span>
            </div>

            {/* Streak */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${profile.streak > 0 ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                <Flame className={`w-4 h-4 ${profile.streak > 0 ? 'fill-orange-500 text-orange-500 animate-pulse' : ''}`} />
                <span className="text-sm font-bold">{profile.streak} Day Streak</span>
            </div>
        </div>
    );
};