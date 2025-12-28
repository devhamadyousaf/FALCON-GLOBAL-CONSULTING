import { useEffect } from 'react';
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

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

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
      console.log('✅ User onboarding complete, allowing dashboard access');
      return;
    }

    // Wait for onboarding context to finish loading before checking
    if (onboardingLoading) return;

    // Fallback: Check if onboarding is complete via context
    if (!canAccessDashboard()) {
      console.log('❌ Onboarding not complete, redirecting to onboarding');
      router.push('/onboarding-new');
      return;
    }
  }, [isAuthenticated, user, authLoading, canAccessDashboard, onboardingLoading, router]);

  // Show loading state while checking auth or onboarding
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
