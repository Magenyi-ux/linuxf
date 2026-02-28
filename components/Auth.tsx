
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogIn, UserPlus, GraduationCap } from 'lucide-react';

interface AuthProps {
    onAuthComplete: (user: UserProfile) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthComplete }) => {
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        const newUser: UserProfile = {
            name: name.trim(),
            level: 1,
            xp: 0,
            streak: 0,
            joinedDate: Date.now()
        };

        // For a prototype, we just save and notify
        localStorage.setItem('waExamPrep_user', JSON.stringify(newUser));
        onAuthComplete(newUser);
    };

    return (
        <div className="max-w-xl mx-auto mt-12 p-12 bg-white rounded-[3rem] shadow-2xl shadow-brand-900/5 border border-gray-100 animate-fade-in-up relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full translate-x-32 -translate-y-32 transition-transform duration-700 group-hover:scale-110" />

            <div className="flex flex-col items-center mb-10 relative z-10">
                <div className="bg-brand-600 p-6 rounded-[2rem] mb-6 shadow-xl shadow-brand-200 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight text-center">
                    {isSignUp ? 'Master your Exams' : 'Welcome Back'}
                </h2>
                <p className="text-gray-500 font-medium text-center mt-3 max-w-xs mx-auto">
                    {isSignUp
                        ? 'Join the community of students scoring above 300 in JAMB.'
                        : 'Continue your journey to academic excellence.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        {isSignUp ? 'Full Name' : 'Your Identity'}
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ebuka Chima"
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brand-500 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-brand-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isSignUp ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                    {isSignUp ? 'Start Practicing' : 'Sign In Now'}
                </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-100 text-center relative z-10">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-brand-600 font-black text-xs uppercase tracking-widest hover:text-brand-700 transition-colors"
                >
                    {isSignUp ? 'Already a member? Sign In' : "New here? Create Account"}
                </button>
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 relative z-10">
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider leading-relaxed flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Offline First App
                </p>
                <p className="text-xs text-amber-600/80 font-medium mt-1">Your progress is safely stored on this device.</p>
            </div>
        </div>
    );
};
