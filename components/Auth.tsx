import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import type { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analytics';

interface AuthProps {
  onAuthComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

const friendlyAuthError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
  if (message.toLowerCase().includes('invalid login credentials')) return 'The email or password is incorrect.';
  if (message.toLowerCase().includes('user already registered')) return 'An account with this email already exists. Try signing in.';
  if (message.toLowerCase().includes('email not confirmed')) return 'Please confirm your email address before signing in.';
  return message;
};

export const Auth: React.FC<AuthProps> = ({ onAuthComplete, onBack }) => {
  const { user, profile, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      if (mode === 'SIGN_UP') {
        if (formData.password.length < 8) {
          throw new Error('Use a password with at least 8 characters.');
        }
        const result = await signUp(formData.name, formData.email, formData.password);
        trackEvent('sign_up', { method: 'email_password' });
        if (result.needsEmailConfirmation) {
          setNotice('Account created. Check your email to confirm the account, then sign in.');
          setMode('SIGN_IN');
          setFormData((previous) => ({ ...previous, password: '' }));
          return;
        }
      } else {
        await signIn(formData.email, formData.password);
        trackEvent('sign_in', { method: 'email_password' });
      }

      const resolvedUser = user;
      const resolvedProfile: UserProfile = profile || {
        id: resolvedUser?.id,
        name: formData.name || undefined,
        email: resolvedUser?.email || formData.email,
        level: 1,
        xp: 0,
        streak: 0,
        role: 'USER',
        timeSpent: 0,
        isBanned: false,
        showChatBot: true,
        chatBotPosition: null,
      };
      onAuthComplete(resolvedProfile);
    } catch (authError) {
      setError(friendlyAuthError(authError));
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
            {mode === 'SIGN_IN' ? 'Sign in to sync your progress across devices.' : 'Create an account to save your progress securely.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">{error}</div>}
          {notice && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold">{notice}</div>}

          {mode === 'SIGN_UP' && (
            <div className="relative">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none"><User className="w-5 h-5 text-gray-400" /></div>
              <input
                type="text"
                required
                autoComplete="name"
                placeholder="Full Name"
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-gray-400" /></div>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Email Address"
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-gray-400" /></div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete={mode === 'SIGN_IN' ? 'current-password' : 'new-password'}
              placeholder="Password"
              className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium text-gray-900"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-gray-600" aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{mode === 'SIGN_IN' ? 'SIGN IN' : 'CREATE ACCOUNT'}<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-500 font-medium">
            {mode === 'SIGN_IN' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(mode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN'); setError(''); setNotice(''); }} className="text-primary-600 font-black hover:underline">
              {mode === 'SIGN_IN' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
