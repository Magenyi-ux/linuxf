import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { capturePostHogEvent, identifyPostHogUser, resetPostHog } from '../services/posthogClient';
import { attributeStoredReferral } from '../services/referralService';
import { activateOfflineSession, clearOfflineSession, hasOfflineSession } from '../services/offlineSession';

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
  signIn: (email: string, password: string) => Promise<UserProfile>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean; profile?: UserProfile }>;
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
  const hydrationVersion = useRef(0);

  // Reject an unrecognised offline session before publishing it to AuthGate.
  // Keep Supabase calls outside its auth-state callback to avoid callback deadlocks.
  const rejectUntrustedOfflineSession = (candidate: Session | null): boolean => {
    if (!candidate?.user || navigator.onLine || hasOfflineSession(candidate.user.id)) {
      return false;
    }

    setSession(null);
    setProfile(null);
    resetPostHog();
    window.setTimeout(() => {
      void supabase.auth.signOut({ scope: 'local' });
    }, 0);
    return true;
  };

  const loadSessionProfile = async (
    nextSession: Session | null,
    requestVersion: number
  ): Promise<void> => {
    if (requestVersion !== hydrationVersion.current) return;
    if (rejectUntrustedOfflineSession(nextSession)) return;

    // Publish the session only after the synchronous offline-session guard passes.
    setSession(nextSession);
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    identifyPostHogUser(nextSession.user.id);

    if (!navigator.onLine) {
      // An existing offline marker is required to enter with cached session data.
      setProfile(buildProfile(nextSession.user));
      return;
    }

    // Online restored sessions can create/migrate the offline marker.
    activateOfflineSession(nextSession.user.id);

    try {
      const row = await getProfileRow(nextSession.user.id);
      // Ignore a response if a newer sign-in/sign-out event has occurred.
      if (requestVersion !== hydrationVersion.current) return;
      setProfile(buildProfile(nextSession.user, row));
    } catch (error) {
      if (requestVersion !== hydrationVersion.current) return;
      console.error('Could not load account profile:', error);
      // Auth remains usable if the optional profile row is temporarily unavailable.
      setProfile(buildProfile(nextSession.user));
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let initialSessionResolved = false;

    // Restore the persisted session and release the gate before remote profile
    // hydration. The auth listener and getSession may resolve in either order.
    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted || initialSessionResolved) return;
      initialSessionResolved = true;
      setLoading(false);
      const requestVersion = ++hydrationVersion.current;
      void loadSessionProfile(initialSession, requestVersion);
    }).catch((error) => {
      if (!mounted || initialSessionResolved) return;
      console.warn('Could not restore the saved session:', error);
      initialSessionResolved = true;
      ++hydrationVersion.current;
      setSession(null);
      setProfile(null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') {
        if (initialSessionResolved) return;
        initialSessionResolved = true;
        setLoading(false);
      }

      // Invalidate any profile request started for an older auth state.
      const requestVersion = ++hydrationVersion.current;

      // Validate offline access before setting the session: AuthGate renders the
      // protected app as soon as it sees a user, independently of profile loading.
      if (rejectUntrustedOfflineSession(nextSession)) {
        setLoading(false);
        return;
      }

      setSession(nextSession);
      if (nextSession?.user) {
        identifyPostHogUser(nextSession.user.id);
      } else {
        setProfile(null);
      }

      // Defer profile I/O until after Supabase's auth callback returns.
      window.setTimeout(() => {
        if (mounted) void loadSessionProfile(nextSession, requestVersion);
      }, 0);
    });

    return () => {
      mounted = false;
      ++hydrationVersion.current;
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
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data.user) activateOfflineSession(data.user.id);
      const row = await getProfileRow(data.user.id).catch((profileError) => {
        console.warn('Could not load profile immediately after sign-in:', profileError);
        return null;
      });
      try {
        await attributeStoredReferral('pwa');
      } catch (referralError) {
        console.warn('Referral attribution was not completed after sign-in:', referralError);
      }
      return buildProfile(data.user, row);
    },
    sendPasswordResetEmail: async (email) => {
      if (!isSupabaseConfigured) throw new Error('Authentication is not configured yet.');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://spherelearn.name.ng/reset-password',
      });
      if (error) throw error;
    },
    signUp: async (name, email, password) => {
      if (!isSupabaseConfigured) throw new Error('Authentication is not configured yet.');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) throw error;
      if (!data.session || !data.user) return { needsEmailConfirmation: true };
      activateOfflineSession(data.user.id);

      const row = await getProfileRow(data.user.id).catch((profileError) => {
        console.warn('Could not load profile immediately after sign-up:', profileError);
        return null;
      });
      try {
        await attributeStoredReferral('pwa');
      } catch (referralError) {
        console.warn('Referral attribution was not completed after sign-up:', referralError);
      }
      return { needsEmailConfirmation: false, profile: buildProfile(data.user, row) };
    },
    signOut: async () => {
      if (!isSupabaseConfigured) return;
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      clearOfflineSession();
      capturePostHogEvent('sign_out');
      resetPostHog();
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
