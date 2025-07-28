'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types';

// 🔍 DEBUG: File loading
console.log('🔍 DEBUG: ClientAuthProvider file loaded at:', new Date().toISOString());

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 DEBUG: fetchUserProfile called for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();  // ← CHANGED: single() to maybeSingle()

      if (error) {
        console.error('🔍 DEBUG: Error fetching user profile:', error);
        return null;
      }

      console.log('🔍 DEBUG: User profile fetched successfully:', data);
      return data as UserProfile;
    } catch (error) {
      console.error('🔍 DEBUG: Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Log user activity
  const logActivity = async (activityType: string, activityData?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData,
          ip_address: null, // Could be added with additional setup
          user_agent: typeof window !== 'undefined' ? navigator.userAgent : null
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    console.log('🔍 DEBUG: useEffect - ClientAuthProvider mounted');
    
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 DEBUG: Getting initial session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔍 DEBUG: Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('🔍 DEBUG: Initial session found for user:', session.user.email);
          setUser(session.user);
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
          
          // Log login activity
          await logActivity('login');
        } else {
          console.log('🔍 DEBUG: No initial session found');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('🔍 DEBUG: Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 DEBUG: Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        console.log('🔍 DEBUG: User authenticated:', session.user.email);
        setUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        setUserProfile(profile);
        
        if (event === 'SIGNED_IN') {
          console.log('🔍 DEBUG: SIGNED_IN event detected, redirecting to dashboard...');
          await logActivity('login');
          
          // Redirect to dashboard after successful sign in
          if (typeof window !== 'undefined') {
            console.log('🔍 DEBUG: Performing redirect to /dashboard');
            window.location.href = '/dashboard';
          }
        }
      } else {
        console.log('🔍 DEBUG: User signed out or no session');
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('🔍 DEBUG: signUp called for email:', email);
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) throw error;

      console.log('🔍 DEBUG: signUp successful:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('🔍 DEBUG: Sign up error:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔍 DEBUG: signIn called for email:', email);
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('🔍 DEBUG: signIn successful:', data);
      
      // Note: Redirect will be handled by onAuthStateChange listener
      // when SIGNED_IN event is triggered
      
      return { data, error: null };
    } catch (error: any) {
      console.error('🔍 DEBUG: Sign in error:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔍 DEBUG: signOut called');
    try {
      setLoading(true);
      
      // Log logout activity before signing out
      if (user) {
        await logActivity('logout');
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      console.log('🔍 DEBUG: signOut successful');
    } catch (error) {
      console.error('🔍 DEBUG: Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error('No user logged in');
    }

    console.log('🔍 DEBUG: updateProfile called:', profileData);
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data as UserProfile);
      
      // Log profile update activity
      await logActivity('profile_update', profileData);
      
      console.log('🔍 DEBUG: updateProfile successful:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('🔍 DEBUG: Update profile error:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    console.log('🔍 DEBUG: refreshProfile called');
    try {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('🔍 DEBUG: Error refreshing profile:', error);
    }
  };

  // Check if user email is verified
  const isEmailVerified = user?.email_confirmed_at != null;

  const value = {
    user,
    userProfile,
    loading,
    isEmailVerified,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    logActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    requireEmailVerification?: boolean;
    requireProfile?: boolean;
    redirectTo?: string;
  } = {}
) {
  return function ProtectedComponent(props: T) {
    const { user, userProfile, loading, isEmailVerified } = useAuth();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
      if (loading) return;

      // Check if user is logged in
      if (!user) {
        setShouldRedirect(true);
        return;
      }

      // Check email verification requirement
      if (options.requireEmailVerification && !isEmailVerified) {
        setShouldRedirect(true);
        return;
      }

      // Check profile requirement
      if (options.requireProfile && !userProfile) {
        setShouldRedirect(true);
        return;
      }

      setShouldRedirect(false);
    }, [user, userProfile, loading, isEmailVerified]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (shouldRedirect) {
      if (typeof window !== 'undefined') {
        const redirectPath = options.redirectTo || '/auth/login';
        const currentPath = window.location.pathname;
        const redirectUrl = `${redirectPath}?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = redirectUrl;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default ClientAuthProvider;
export { ClientAuthProvider };
