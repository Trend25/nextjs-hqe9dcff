'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types';
import { useRouter, usePathname } from 'next/navigation';

// 🔍 DEBUG: File loaded
console.log('🔍 DEBUG: ClientAuthProvider loaded at', new Date().toISOString());

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!SUPABASE_ANON_KEY) console.error('🚨 ERROR: Supabase anon key missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: get stored auth token from localStorage
const getStoredAuth = (): Session | null => {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem(`sb-${SUPABASE_URL.split('//')[1]}-auth-token`);
    return token ? JSON.parse(token) : null;
  } catch {
    return null;
  }
};

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const stored = getStoredAuth();

  const [user, setUser] = useState<User | null>(stored?.user || null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user profile
  const fetchUserProfile = async (id: string): Promise<UserProfile> => {
    console.log('🔍 DEBUG: fetchUserProfile', id);
    try {
      const { data, error } = await supabase
        .from<UserProfile>('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('🔍 DEBUG: fetchUserProfile error', e);
      return {
        id,
        email: user?.email || '',
        full_name: user?.user_metadata?.full_name || '',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  };

  // Log activity
  const logActivity = async (type: string, data?: any) => {
    if (!user) return;
    try {
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: type,
        activity_data: data,
        ip_address: null,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
      });
    } catch (e) {
      console.error('🔍 DEBUG: logActivity error', e);
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG: AuthProvider mount');
    let active = true;
    const timeoutId = setTimeout(() => {
      if (active && loading) {
        console.log('🚨 DEBUG: loading timeout');
        setLoading(false);
      }
    }, 15000);

    // Initialize session
    const init = async () => {
      console.log('🔍 DEBUG: getSession');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        let currentUser = session?.user;
        if (!currentUser && stored?.user) {
          currentUser = stored.user;
        }
        if (currentUser && active) {
          setUser(currentUser);
          const profile = await fetchUserProfile(currentUser.id);
          if (active) setUserProfile(profile);
        }
      } catch (e) {
        console.error('🔍 DEBUG: init error', e);
      } finally {
        if (active) setLoading(false);
        clearTimeout(timeoutId);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 DEBUG: onAuthStateChange', event);
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          await logActivity('login');
          if (pathname !== '/dashboard') router.push('/dashboard');
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          await logActivity('logout');
          if (pathname !== '/auth/login') router.push('/auth/login');
        }
        setLoading(false);
        clearTimeout(timeoutId);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [router, pathname]);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('🔍 DEBUG: signUp', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || '' }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      console.log('🔍 DEBUG: signUp success', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: signUp error', e);
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔍 DEBUG: signIn', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('🔍 DEBUG: signIn success', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: signIn error', e);
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔍 DEBUG: signOut');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('🔍 DEBUG: signOut success');
    } catch (e) {
      console.error('🔍 DEBUG: signOut error', e);
    } finally {
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    console.log('🔍 DEBUG: updateProfile', profileData);
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<UserProfile>('profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setUserProfile(data);
      await logActivity('profile_update', profileData);
      console.log('🔍 DEBUG: updateProfile success', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: updateProfile error', e);
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    console.log('🔍 DEBUG: refreshProfile');
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      console.log('🔍 DEBUG: profile refreshed');
    }
  };

  const isEmailVerified = Boolean(user?.email_confirmed_at);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    logActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// HOC for protected routes
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  options: { requireEmailVerified?: boolean; requireProfile?: boolean; redirectTo?: string } = {}
) {
  return function Protected(props: T) {
    const { user, userProfile, loading, isEmailVerified } = useContext(AuthContext)!;
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
      if (loading) return;
      if (!user) {
        setShouldRedirect(true);
      } else if (options.requireEmailVerified && !isEmailVerified) {
        setShouldRedirect(true);
      } else if (options.requireProfile && !userProfile) {
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    }, [user, userProfile, loading, isEmailVerified]);

    if (loading) {
      return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500"></div></div>;
    }

    if (shouldRedirect) {
      if (typeof window !== 'undefined') {
        const to = options.redirectTo || '/auth/login';
        const current = window.location.pathname;
        window.location.href = `${to}?redirect=${encodeURIComponent(current)}`;
      }
      return null;
    }

    return <Component {...props} />;
  };
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}

export default ClientAuthProvider;
