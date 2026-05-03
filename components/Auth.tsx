
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthProps {
  onAuthComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthComplete, onBack }) => {
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Use consistent prefix
      const users = JSON.parse(localStorage.getItem('waExamPrep_users') || '[]');

      if (mode === 'SIGN_UP') {
        if (users.find((u: any) => u.email === formData.email)) {
          throw new Error('User already exists with this email.');
        }

        const isAdminEmail = formData.email === import.meta.env.VITE_ADMIN_EMAIL;

        // Simulating password hashing/secure storage by not storing the password in the public profile
        const newProfile: UserProfile = {
          name: formData.name,
          email: formData.email,
          level: isAdminEmail ? 99 : 1,
          xp: 0,
          streak: 0,
          role: isAdminEmail ? 'ADMIN' : 'USER',
          timeSpent: 0,
          isBanned: false
        };

        const userData = {
          ...newProfile,
          password: formData.password // In a real app, this would be hashed
        };

        users.push(userData);
        localStorage.setItem('waExamPrep_users', JSON.stringify(users));
        localStorage.setItem('waExamPrep_session', JSON.stringify(newProfile));
        onAuthComplete(newProfile);
      } else {
        const userMatch = users.find((u: any) => u.email === formData.email && u.password === formData.password);
        if (!userMatch) {
          throw new Error('Invalid email or password.');
        }

        if (userMatch.isBanned) {
          throw new Error('This account has been banned from the platform.');
        }

        // Remove password before setting session and profile
        const { password, ...sessionProfile } = userMatch;
        localStorage.setItem('waExamPrep_session', JSON.stringify(sessionProfile));
        onAuthComplete(sessionProfile as UserProfile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto py-12">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>

      <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="bg-primary-600 p-4 rounded-3xl mb-6 shadow-xl shadow-primary-500/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {mode === 'SIGN_IN' ? 'Welcome Back!' : 'Join Examply'}
          </h2>
          <p className="text-gray-500 font-medium">
            {mode === 'SIGN_IN' ? 'Sign in to continue your progress.' : 'Create an account to start your journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          {mode === 'SIGN_UP' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              placeholder="Email Address"
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {mode === 'SIGN_IN' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 font-medium">
            {mode === 'SIGN_IN' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => {
                setMode(mode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN');
                setError('');
              }}
              className="text-primary-600 font-black hover:underline"
            >
              {mode === 'SIGN_IN' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
