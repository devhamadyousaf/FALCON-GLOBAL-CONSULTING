import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { createTimeoutPromise, retryOperation } from '../../utils/asyncHelpers';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Set a 10-second timeout for the entire callback process
      timeoutRef.current = setTimeout(() => {
        console.error('Auth callback timeout - forcing redirect to login');
        router.push('/login?error=callback_timeout');
      }, 10000);

      try {
        console.log('🔐 Auth callback started');

        // Get the session from the URL with timeout
        const getSessionOperation = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          return session;
        };

        const session = await Promise.race([
          retryOperation(getSessionOperation, 2, 500),
          createTimeoutPromise(5000, 'Get session')
        ]);

        if (!session) {
          console.error('No session found');
          router.push('/login?error=no_session');
          return;
        }

        console.log('✅ Session found, fetching profile...');

        // Check if user has completed onboarding with timeout
        const getProfileOperation = async () => {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, onboarding_complete')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          return profile;
        };

        const profile = await Promise.race([
          retryOperation(getProfileOperation, 2, 500),
          createTimeoutPromise(5000, 'Fetch profile')
        ]);

        console.log('✅ Profile fetched:', { role: profile?.role, onboardingComplete: profile?.onboarding_complete });

        // Clear timeout before redirecting
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Redirect based on role and onboarding status
        if (profile?.role === 'admin') {
          console.log('🔀 Redirecting to admin dashboard');
          router.push('/dashboard/admin');
        } else if (profile?.onboarding_complete) {
          console.log('🔀 Redirecting to customer dashboard');
          router.push('/dashboard/customer');
        } else {
          console.log('🔀 Redirecting to onboarding');
          router.push('/onboarding-new');
        }
      } catch (error) {
        console.error('❌ Callback error:', error);
        setError(error.message);

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?error=callback_failed');
        }, 2000);
      }
    };

    handleCallback();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        {error ? (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Completing sign in...</h2>
            <p className="text-gray-600 mt-2">Please wait while we redirect you.</p>
          </>
        )}
      </div>
    </div>
  );
}
