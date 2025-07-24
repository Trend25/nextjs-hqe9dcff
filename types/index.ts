'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function ClientAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createUserProfile(userId);
          return;
        }
        throw error;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // Create user profile
  const createUserProfile = async (userId: string): Promise<void> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      
      if (!user) throw new Error('No user found');

      const profileData: Partial<UserProfile> = {
        id: userId,
        email: user.email!,
        full_name: user.user_metadata?.full_name || '',
        role: 'entrepreneur', // default role
        onboarding_completed: false,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) throw error;

      // Log signup activity
      if (data.user) {
        await logUserActivity(data.user.id, 'signup', { email });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log login activity
      if (data.user) {
        await logUserActivity(data.user.id, 'login', { email });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Log logout activity before signing out
      if (user) {
        await logUserActivity(user.id, 'logout', {});
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user || !userProfile) {
      throw new Error('No user logged in');
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUserProfile({
        ...userProfile,
        ...data,
        updated_at: new Date().toISOString(),
      });

      // Log profile update activity
      await logUserActivity(user.id, 'profile_update', data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Refresh user profile
  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    await fetchUserProfile(user.id);
  };

  // Log user activity
  const logUserActivity = async (
    userId: string, 
    activityType: string, 
    activityData: any
  ): Promise<void> => {
    try {
      await supabase.from('user_activity_log').insert([{
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData,
        ip_address: null, // Will be handled by database function if needed
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
      }]);
    } catch (error) {
      // Don't throw - activity logging shouldn't break the app
      console.error('Error logging user activity:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within a ClientAuthProvider');
  }
  
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireProfile?: boolean;
    redirectTo?: string;
  } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { user, userProfile, loading } = useAuth();
    const { requireProfile = false, redirectTo = '/auth' } = options;

    useEffect(() => {
      if (!loading) {
        if (!user) {
          window.location.href = redirectTo;
          return;
        }

        if (requireProfile && (!userProfile || !userProfile.onboarding_completed)) {
          window.location.href = '/onboarding';
          return;
        }
      }
    }, [user, userProfile, loading]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requireProfile && (!userProfile || !userProfile.onboarding_completed)) {
      return null;
    }

    return <Component {...props} />;
  };
}

export { AuthContext };
