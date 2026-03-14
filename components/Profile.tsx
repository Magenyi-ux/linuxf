
import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Zap, Flame, Target, Calendar, Award, Star, Clock } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  onBack: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onBack }) => {
  const accuracy = profile.totalQuestionsAnswered > 0
    ? Math.round((profile.correctAnswers / profile.totalQuestionsAnswered) * 100)
    : 0;

  const nextLevelXp = profile.level * 1000;
  const progressToNextLevel = (profile.xp % 1000) / 10;

  const stats = [
    { label: 'Total XP', value: profile.xp.toLocaleString(), icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Current Streak', value: `${profile.streak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Answered', value: profile.totalQuestionsAnswered.toLocaleString(), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Student Profile</h2>
          <p className="text-lg text-gray-500 font-medium">Your learning journey and achievements.</p>
        </div>
        <div className="flex flex-col items-end">
            <div className="bg-primary-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/20 flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                <span className="text-2xl font-black">Level {profile.level}</span>
            </div>
            <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                {profile.xp % 1000} / 1000 XP to Level {profile.level + 1}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-primary-600" />
                Badges & Achievements
            </h3>
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 ${i <= profile.level ? 'bg-primary-50' : 'bg-gray-50 grayscale opacity-40'}`}>
                        <Star className={`w-8 h-8 ${i <= profile.level ? 'text-primary-600 fill-current' : 'text-gray-300'}`} />
                        <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Rank {i}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                    <Calendar className="w-8 h-8" />
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</div>
                    <div className="text-xl font-black text-gray-900">
                        {new Date(profile.joinedDate).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-600">Level Progress</span>
                        <span className="text-sm font-black text-primary-600">{Math.round(progressToNextLevel)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-primary-600 rounded-full transition-all duration-1000" style={{ width: `${progressToNextLevel}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
