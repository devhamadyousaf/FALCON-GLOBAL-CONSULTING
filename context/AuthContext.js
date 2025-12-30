import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';
import { safeSessionStorage } from '../utils/safeStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast ? useToast() : { showToast: () => {} };

  useEffect(() => {
    let isInitialLoad = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
        isInitialLoad = false;
      }
    };

    initAuth();

    // Listen for auth changes (but skip initial SIGNED_IN event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      // Skip processing if this is the initial load event
      if (isInitialLoad && event === 'INITIAL_SESSION') {
        return;
      }

      // Don't reload profile on token refresh - it just updates the JWT token
      // This prevents interrupting ongoing operations
      if (event === 'TOKEN_REFRESHED') {
        return;
      }

      // Only reload profile for actual auth state changes
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      // Check if email is confirmed (SKIP for Google OAuth users - they're auto-verified)
      const isGoogleUser = authUser.app_metadata?.provider === 'google';
      const emailConfirmed = authUser.email_confirmed_at || isGoogleUser;

      if (!emailConfirmed) {
        console.warn('⚠️ Email not confirmed yet:', authUser.email);
        // Set a minimal user object with unconfirmed flag
        setUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
          avatar: `https://ui-avatars.com/api/?name=${authUser.email}&background=random`,
          emailConfirmed: false,
          requiresEmailConfirmation: true
        });
        return;
      }

      // Fetch profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);

        // Profile might not exist yet (race condition on signup)
        // Create a minimal user object from auth data
        const minimalUser = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
          role: 'customer',
          avatar: authUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${authUser.email}&background=random`,
          onboardingComplete: false,
          createdAt: authUser.created_at,
          emailConfirmed: true
        };
        setUser(minimalUser);
        return;
      }

      // Map database profile to app user format
      const userData = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        role: profile.role,
        avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name || profile.email}&background=random`,
        onboardingComplete: profile.onboarding_complete,
        createdAt: profile.created_at,
        emailConfirmed: true
      };

      setUser(userData);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle authentication errors
      if (error) {
        const errorMessage = error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.' 
          : error.message || 'Login failed';
        
        console.error('Login error:', error);
        
        // Show user-friendly toast message
        if (showToast) {
          showToast(errorMessage, 'error', 5000);
        }
        
        return { success: false, error: errorMessage };
      }

      // Check if user exists in response
      if (!data?.user) {
        const noUserMsg = 'Login failed. Please try again.';
        console.error('No user returned from login');
        
        if (showToast) {
          showToast(noUserMsg, 'error', 4000);
        }
        
        return { success: false, error: noUserMsg };
      }

      // Load user profile
      await loadUserProfile(data.user);

      // Determine role for redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        user: data.user,
        role: profile?.role || 'customer'
      };
    } catch (error) {
      // Catch any unexpected exceptions
      const errorMessage = error?.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error?.message || 'An unexpected error occurred. Please try again.';
      
      console.error('Login exception:', error);
      
      if (showToast) {
        showToast(errorMessage, 'error', 5000);
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone,
            country: userData.country,
          }
        }
      });

      if (authError) {
        console.error('Signup error:', authError);
        return { success: false, error: authError.message };
      }

      // The trigger will automatically create the profile
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update profile with additional data
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: userData.fullName,
            phone: userData.phone,
            country: userData.country,
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        await loadUserProfile(authData.user);
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session
      };
    } catch (error) {
      console.error('Signup exception:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google login error:', error);
        return { success: false, error: error.message };
      }

      // The redirect will happen automatically
      // The session will be established on callback
      return { success: true, redirecting: true };
    } catch (error) {
      console.error('Google login exception:', error);
      return { success: false, error: error.message };
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      // Update profile to mark onboarding as complete
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return { success: false, error: error.message };
      }

      // Update local user state
      const updatedUser = {
        ...user,
        onboardingComplete: true,
        updatedAt: new Date().toISOString()
      };

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Complete onboarding exception:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');

      // Sign out from Supabase Auth with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 3000)
      );

      try {
        const { error } = await Promise.race([signOutPromise, timeoutPromise]);
        if (error) {
          console.error('Logout error:', error);
        }
        console.log('✅ Supabase sign out completed');
      } catch (timeoutError) {
        console.warn('⚠️ Logout timeout - forcing local cleanup:', timeoutError.message);
      }

      // Clear Gmail session connection time (tokens are in database)
      safeSessionStorage.removeItem('gmail_connection_time');
      console.log('✅ Gmail session cleared');

      // Clear user state and redirect
      setUser(null);
      console.log('✅ User logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout exception:', error);

      // Even if logout fails, clear everything
      safeSessionStorage.removeItem('gmail_connection_time');

      setUser(null);
      router.push('/');
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
      }

      // Reload profile
      await loadUserProfile({ id: user.id, email: user.email });
      return { success: true };
    } catch (error) {
      console.error('Update profile exception:', error);
      return { success: false, error: error.message };
    }
  };

  const reloadUserProfile = async () => {
    if (!user?.id) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
        console.log('✅ User profile reloaded');
      }
    } catch (error) {
      console.error('Error reloading user profile:', error);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) {
        return { success: false, error: 'No user email found' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.error('Error resending verification email:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Verification email resent to:', user.email);
      return { success: true };
    } catch (error) {
      console.error('Resend verification exception:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    completeOnboarding,
    logout,
    updateProfile,
    reloadUserProfile,
    resendVerificationEmail,
    isAuthenticated: !!user,
    supabase // Expose supabase client for direct queries if needed
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        // Show minimal loading UI instead of blank screen
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
