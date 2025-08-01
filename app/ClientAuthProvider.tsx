'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, User, Session } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types';
import { useRouter } from 'next/navigation';

// Initialize Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create authentication context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile or return mock
  const fetchUserProfile = async (id: string): Promise<UserProfile> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch {
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

  // Log user activity
  const logActivity = async (type: string, data?: any) => {
    if (!user) return;
    await supabase.from('user_activity_log').insert({
      user_id: user.id,
      activity_type: type,
      activity_data: data,
      ip_address: null,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
    });
  };

  useEffect(() => {
    // Initialize session on mount
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserProfile(await fetchUserProfile(session.user.id));
      }
      setLoading(false);
    };

    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setUserProfile(await fetchUserProfile(session.user.id));
          await logActivity('login');
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          await logActivity('logout');
          router.push('/auth/login');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Auth actions
  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('🔍 DEBUG: signUp', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || '' },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error: error ? error.message : null };
    } catch (e: any) {
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
      return { data, error: error ? error.message : null };
    } catch (e: any) {
      return { data: null, error: e.message };
    } finally {
      setLoading(false);
    }
  };
  

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setLoading(false);
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .single();
    setLoading(false);
    return { data, error };
  };

  const refreshProfile = async () => {
    if (user) setUserProfile(await fetchUserProfile(user.id));
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isEmailVerified: Boolean(user?.email_confirmed_at),
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    logActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for consuming auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within ClientAuthProvider');
  return context;
}

// HOC for protected routes
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: { requireEmailVerified?: boolean; requireProfile?: boolean; redirectTo?: string } = {}
): React.ComponentType<T> {
  return function ProtectedComponent(props: T) {
    const { user, userProfile, loading, isEmailVerified } = useAuth();
    const router = useRouter();
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500"></div>
        </div>
      );
    }
    if (
      !user ||
      (options.requireEmailVerified && !isEmailVerified) ||
      (options.requireProfile && !userProfile)
    ) {
      if (typeof window !== 'undefined') {
        const target = options.redirectTo || '/auth/login';
        const current = window.location.pathname;
        router.push(`${target}?redirect=${encodeURIComponent(current)}`);
      }
      return null;
    }
    return <Component {...props} />;
  };
}

export default ClientAuthProvider;
