'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types';
import { useRouter, usePathname } from 'next/navigation';

// 🔍 DEBUG: File loading
console.log('🔍 DEBUG: ClientAuthProvider file loaded at:', new Date().toISOString());

// ✅ ENVIRONMENT VARIABLES WITH FALLBACKS
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://hfrzxhbwjatdnpftrdgr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// ✅ ERROR CHECK FOR MISSING API KEY
if (!SUPABASE_ANON_KEY) {
  console.error(
    '🚨 ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment variables!'
  );
  console.error(
    '🔧 Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables'
  );
}

console.log('🔍 DEBUG: Environment Variables Config:');
console.log('🔍 DEBUG: - URL:', SUPABASE_URL);
console.log('🔍 DEBUG: - Key length:', SUPABASE_ANON_KEY.length);
console.log('🔍 DEBUG: - Key starts with:', SUPABASE_ANON_KEY.substring(0, 20));
console.log('🔍 DEBUG: - Using env vars:', !!SUPABASE_ANON_KEY);

// Supabase client creation
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('🔍 DEBUG: Supabase client created');

// Create Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get stored auth from localStorage
const getStoredAuth = (): { user: User } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(
      'sb-hfrzxhbwjatdnpftrdgr-auth-token'
    );
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

// Provider component
export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const initialAuth = getStoredAuth();
  console.log('🔍 DEBUG: Initial auth from storage:', !!initialAuth);

  const [user, setUser] = useState<User | null>(
    initialAuth?.user || null
  );
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);
  const [loading, setLoading] =
    useState(!initialAuth);

  // Fetch user profile helper
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile> => {
    console.log('🔍 DEBUG: fetchUserProfile for', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as UserProfile;
    } catch (e) {
      console.error('🔍 DEBUG: Error fetching profile:', e);
    }
    // Fallback mock profile
    return {
      id: userId,
      email: initialAuth?.user?.email || '',
      full_name:
        initialAuth?.user?.user_metadata?.full_name || '',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  // Log activity helper
  const logActivity = async (
    activityType: string,
    activityData?: any
  ) => {
    if (!user) return;
    try {
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData,
        ip_address: null,
        user_agent:
          typeof window !== 'undefined'
            ? navigator.userAgent
            : null,
      });
    } catch (e) {
      console.error('🔍 DEBUG: Error logging activity:', e);
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG: AuthProvider mounted');
    let active = true;
    const timeoutId = setTimeout(() => {
      if (active && loading) {
        console.log(
          '🚨 DEBUG: Loading timeout, forcing loading=false'
        );
        setLoading(false);
      }
    }, 15000);

    // Initialize session and profile
    const initialize = async () => {
      console.log('🔍 DEBUG: getSession');
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(
            session.user.id
          );
          if (!active) return;
          setUserProfile(profile);
        } else if (initialAuth?.user) {
          setUser(initialAuth.user);
          const profile = await fetchUserProfile(
            initialAuth.user.id
          );
          if (!active) return;
          setUserProfile(profile);
        } else {
          localStorage.removeItem(
            'sb-hfrzxhbwjatdnpftrdgr-auth-token'
          );
          setUser(null);
        }
      } catch (e) {
        console.error('🔍 DEBUG: init error:', e);
      } finally {
        if (active) setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initialize();

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 DEBUG: onAuthStateChange', event);
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchUserProfile(
            session.user.id
          );
          if (active) setUserProfile(profile);

          // 🔄 Redirect only on SIGNED_IN
          if (
            event === 'SIGNED_IN' &&
            pathname !== '/dashboard'
          ) {
            router.push('/dashboard');
          }

          if (event === 'SIGNED_IN') {
            await logActivity('login');
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        if (active) setLoading(false);
        clearTimeout(timeoutId);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [router, pathname]);

  // Auth methods
  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    console.log('🔍 DEBUG: signUp called for email:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
          data: { full_name: fullName || '' },
        },
      });
      if (error) throw error;
      console.log('🔍 DEBUG: signUp successful:', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: Sign up error:', e);
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string
  ) => {
    console.log('🔍 DEBUG: signIn called for email:', email);
    setLoading(true);
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      if (error) throw error;
      console.log('🔍 DEBUG: signIn successful:', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: Sign in error:', e);
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔍 DEBUG: signOut called');
    setLoading(true);
    if (user) await logActivity('logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('🔍 DEBUG: signOut successful');
    } catch (e) {
      console.error('🔍 DEBUG: signOut error:', e);
    } finally {
      setUser(null);
      setUserProfile(null);
      setLoading(false);
    }
  };

  const updateProfile = async (
    profileData: Partial<UserProfile>
  ) => {
    console.log('🔍 DEBUG: updateProfile called:', profileData);
    if (!user || !userProfile) {
      throw new Error('No user logged in');
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      setUserProfile(data as UserProfile);
      await logActivity('profile_update', profileData);
      console.log('🔍 DEBUG: updateProfile successful:', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: Update profile error:', e);
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    console.log('🔍 DEBUG: refreshProfile called');
    if (!user) return;
    try {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      console.log('🔍 DEBUG: Profile refreshed');
    } catch (e) {
      console.error('🔍 DEBUG: Error refreshing profile:', e);
    }
  };

  const isEmailVerified =
    Boolean(user?.email_confirmed_at);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to consume auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }
  return ctx;
}

export default ClientAuthProvider;
