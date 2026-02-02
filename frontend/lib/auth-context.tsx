'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Tier } from '@/lib/types';

type OAuthProvider = 'google' | 'github';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  /** 계정 티어 (profiles.tier). 가입=light, 결제/수동업그레이드=pro/heavy */
  userTier: Tier;
  /** userTier 로딩 중 (로그인 시 profile fetch 대기) */
  userTierLoading: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userTier, setUserTier] = useState<Tier>('light');
  const [userTierLoading, setUserTierLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // 로그인 시 profile.tier 조회
  useEffect(() => {
    if (!user) {
      setUserTier('light');
      setUserTierLoading(false);
      return;
    }
    setUserTierLoading(true);
    fetch('/api/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.tier) {
          setUserTier(json.data.tier as Tier);
        } else {
          setUserTier('light');
        }
      })
      .catch(() => setUserTier('light'))
      .finally(() => setUserTierLoading(false));
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Auth not configured') };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Auth not configured') };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    if (!supabase) return { error: new Error('Auth not configured') };
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    return { error };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, userTier, userTierLoading, loading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      session: null,
      userTier: 'light' as Tier,
      userTierLoading: false,
      loading: false,
      signIn: async () => ({ error: new Error('Auth not configured') }),
      signUp: async () => ({ error: new Error('Auth not configured') }),
      signInWithOAuth: async () => ({ error: new Error('Auth not configured') }),
      signOut: async () => {},
    };
  }
  return context;
}
