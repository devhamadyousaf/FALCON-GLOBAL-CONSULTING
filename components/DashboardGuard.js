import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

/**
 * DashboardGuard - Protects dashboard routes
 * Ensures users have completed all onboarding steps before accessing dashboard
 */
export default function DashboardGuard({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { canAccessDashboard, onboardingData, loading: onboardingLoading } = useOnboarding();
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef(null);

  // Set a 15-second timeout to prevent infinite loading
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If still loading after 15 seconds, force continue with what we have
    if (authLoading || onboardingLoading) {
      timeoutRef.current = setTimeout(() => {
        console.warn('⚠️ DashboardGuard loading timeout - forcing access check');
        setTimedOut(true);
      }, 15000);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [authLoading, onboardingLoading]);

  useEffect(() => {
    // Wait for auth to finish loading (unless timed out)
    if (authLoading && !timedOut) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Admin users can always access dashboard
    if (user?.role === 'admin') {
      return;
    }

    // Check onboarding_complete from user profile (more reliable than onboarding context)
    // If user.onboardingComplete is true, they can access dashboard
    // This avoids issues with onboarding context database timeouts
    if (user?.onboardingComplete === true) {
      return;
    }

    // Wait for onboarding context to finish loading before checking (unless timed out)
    if (onboardingLoading && !timedOut) return;

    // Fallback: Check if onboarding is complete via context
    if (!canAccessDashboard()) {
      router.push('/onboarding-new');
      return;
    }
  }, [isAuthenticated, user, authLoading, canAccessDashboard, onboardingLoading, router, timedOut]);

  // Show loading state while checking auth or onboarding (unless timed out)
  if ((authLoading || onboardingLoading) && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we redirect you.</p>
        </div>
      </div>
    );
  }

  // Final access check before rendering
  // Allow access if user.onboardingComplete is true OR canAccessDashboard() returns true
  const hasAccess = user?.role === 'admin' || user?.onboardingComplete === true || canAccessDashboard();

  if (!isAuthenticated || !hasAccess) {
    // Don't show another loading spinner - the redirect in useEffect will handle it
    // Just return null to prevent flash of content
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * HOC version - wrap your dashboard pages with this
 */
export function withDashboardGuard(Component) {
  return function GuardedComponent(props) {
    return (
      <DashboardGuard>
        <Component {...props} />
      </DashboardGuard>
    );
  };
}
