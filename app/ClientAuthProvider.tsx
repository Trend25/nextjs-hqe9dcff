'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types';
import { useRouter, usePathname } from 'next/navigation';

// 🔍 DEBUG: File loading
console.log('🔍 DEBUG: ClientAuthProvider file loaded at:', new Date().toISOString());

// ✅ ENVIRONMENT VARIABLES
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hfrzxhbwjatdnpftrdgr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!SUPABASE_ANON_KEY) console.error('🚨 ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY missing!');
console.log('🔍 DEBUG: Env Config:', { SUPABASE_URL, anonKeySet: !!SUPABASE_ANON_KEY });

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or mock user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    console.log('🔍 DEBUG: fetchUserProfile', userId);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (data) return data as UserProfile;
    } catch (e) {
      console.error('🔍 DEBUG: fetchUserProfile error', e);
    }
    return { id: userId, email: user?.email || '', full_name: user?.user_metadata?.full_name || '', avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  };

  // Log activity
  const logActivity = async (type: string, data?: any) => {
    if (!user) return;
    try {
      await supabase.from('user_activity_log').insert({ user_id: user.id, activity_type: type, activity_data: data, ip_address: null, user_agent: typeof window !== 'undefined' ? navigator.userAgent : null });
    } catch (e) {
      console.error('🔍 DEBUG: logActivity error', e);
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG: AuthProvider mounted');
    let active = true;
    let ignoreInitial = true;  // Ignore first onAuthStateChange event
    const timer = setTimeout(() => { if (active) setLoading(false); }, 15000);

    const init = async () => {
      console.log('🔍 DEBUG: supabase.auth.getSession');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user && active) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (active) setUserProfile(profile);
        }
      } catch (e) {
        console.error('🔍 DEBUG: init error', e);
      } finally {
        if (active) setLoading(false);
        clearTimeout(timer);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 DEBUG: onAuthStateChange', event);
        if (ignoreInitial) {
          ignoreInitial = false;
          return;
        }
        if (session?.user && active) {
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          if (active) setUserProfile(profile);

          if (event === 'SIGNED_IN') {
            await logActivity('login');
            if (pathname !== '/dashboard') router.push('/dashboard');
          }
        } else if (active) {
          setUser(null);
          setUserProfile(null);
        }
        if (active) setLoading(false);
        clearTimeout(timer);
      }
    );

    return () => { active = false; subscription.unsubscribe(); clearTimeout(timer); };
  }, [router, pathname]);

  // Auth methods
  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('🔍 DEBUG: signUp', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined, data: { full_name: fullName || '' } } });
      if (error) throw error;
      console.log('🔍 DEBUG: signUp success', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: signUp error', e);
      return { data: null, error: e.message };
    } finally { setLoading(false); }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔍 DEBUG: signIn', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log('🔍 DEBUG: signIn success', data);
      // Manual redirect after successful signIn
      if (typeof window !== 'undefined') {
        router.push('/dashboard');
      }
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: signIn error', e);
      return { data: null, error: e.message };
    } finally { setLoading(false); }
  };

  const signOut = async () => {
    console.log('🔍 DEBUG: signOut');
    setLoading(true);
    if (user) await logActivity('logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('🔍 DEBUG: signOut success');
    } catch (e) {
      console.error('🔍 DEBUG: signOut error', e);
    } finally {
      setUser(null); setUserProfile(null); setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    console.log('🔍 DEBUG: updateProfile', profileData);
    if (!user) throw new Error('Not authenticated');
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').update({ ...profileData, updated_at: new Date().toISOString() }).eq('id', user.id).select().single();
      if (error) throw error;
      setUserProfile(data as UserProfile);
      await logActivity('profile_update', profileData);
      console.log('🔍 DEBUG: updateProfile success', data);
      return { data, error: null };
    } catch (e: any) {
      console.error('🔍 DEBUG: updateProfile error', e);
      return { data: null, error: e.message };
    } finally { setLoading(false); }
  };

  const refreshProfile = async () => {
    console.log('🔍 DEBUG: refreshProfile');
    if (!user) return;
    try {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      console.log('🔍 DEBUG: profile refreshed');
    } catch (e) { console.error('🔍 DEBUG: refreshProfile error', e); }
  };

  const isEmailVerified = Boolean(user?.email_confirmed_at);

  const value: AuthContextType = { user, userProfile, loading, isEmailVerified, signUp, signIn, signOut, updateProfile, refreshProfile, logActivity };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default ClientAuthProvider;
