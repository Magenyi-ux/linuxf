
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
        <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-brand-600 p-4 rounded-2xl mb-4 shadow-lg">
                    <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {isSignUp ? 'Create your Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-500 text-center mt-2">
                    {isSignUp
                        ? 'Join thousands of students preparing for WAEC, JAMB & NECO.'
                        : 'Pick up right where you left off.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        {isSignUp ? 'Full Name' : 'Enter your name'}
                    </label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                >
                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                    {isSignUp ? 'Start Learning' : 'Sign In'}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-brand-600 font-semibold hover:underline"
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Note:</strong> This is an offline prototype. Your data is stored locally on this device.
                </p>
            </div>
        </div>
    );
};
