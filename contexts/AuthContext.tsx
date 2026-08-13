import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { capturePostHogEvent } from '../services/posthogClient';
import { attributeStoredReferral } from '../services/referralService';

interface ProfileRow {
  id: string;
  display_name: string | null;
  role: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const buildProfile = (user: User, row?: ProfileRow | null): UserProfile => ({
  id: user.id,
  name: row?.display_name || (user.user_metadata?.full_name as string | undefined) || undefined,
  email: user.email || undefined,
  level: 1,
  xp: 0,
  streak: 0,
  role: row?.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER',
  timeSpent: 0,
  isBanned: false,
  showChatBot: true,
  chatBotPosition: null,
});

const getProfileRow = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as ProfileRow | null;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSessionProfile = async (nextSession: Session | null): Promise<void> => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    try {
      const row = await getProfileRow(nextSession.user.id);
      setProfile(buildProfile(nextSession.user, row));
    } catch (error) {
      console.error('Could not load account profile:', error);
      // Auth remains usable even if the optional profile row is temporarily unavailable.
      setProfile(buildProfile(nextSession.user));
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      void loadSessionProfile(initialSession).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      void loadSessionProfile(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user || null,
    session,
    profile,
    loading,
    signIn: async (email, password) => {
      if (!isSupabaseConfigured) throw new Error('Authentication is not configured yet.');
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      try {
        await attributeStoredReferral('pwa');
      } catch (referralError) {
        console.warn('Referral attribution was not completed after sign-in:', referralError);
      }
    },
    signUp: async (name, email, password) => {
      if (!isSupabaseConfigured) throw new Error('Authentication is not configured yet.');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      if (data.session) {
        try {
          await attributeStoredReferral('pwa');
        } catch (referralError) {
          console.warn('Referral attribution was not completed after sign-up:', referralError);
        }
      }
      return { needsEmailConfirmation: !data.session };
    },
    signOut: async () => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      capturePostHogEvent('sign_out');
    },
    refreshProfile: async () => {
      if (!session?.user) return;
      const row = await getProfileRow(session.user.id);
      setProfile(buildProfile(session.user, row));
    },
  }), [loading, profile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
