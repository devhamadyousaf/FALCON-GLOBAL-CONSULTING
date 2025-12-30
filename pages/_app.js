import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { OnboardingProvider } from '../context/OnboardingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { LoadingProvider, useLoading } from '../context/LoadingContext';
import PageLoader from '../components/PageLoader';
import { ToastProvider } from '../context/ToastContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as gtag from '../lib/gtag';
import SafeStorage from '../utils/safeStorage';

function AppInner({ Component, pageProps }) {
  const { loading } = useLoading();
  const router = useRouter();

  // Check storage health on app initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if localStorage is available and working
      const localStorageAvailable = SafeStorage.isStorageAvailable(localStorage);
      const sessionStorageAvailable = SafeStorage.isStorageAvailable(sessionStorage);

      if (!localStorageAvailable) {
        console.warn('⚠️ localStorage not available or corrupted, attempting recovery...');
        SafeStorage.attemptStorageRecovery(localStorage);
      }

      if (!sessionStorageAvailable) {
        console.warn('⚠️ sessionStorage not available or corrupted, attempting recovery...');
        SafeStorage.attemptStorageRecovery(sessionStorage);
      }

      // Log storage usage for debugging
      const localStorageSize = SafeStorage.getStorageSize(localStorage);
      const sessionStorageSize = SafeStorage.getStorageSize(sessionStorage);
      console.log(`📊 Storage usage - localStorage: ${(localStorageSize / 1024).toFixed(2)}KB, sessionStorage: ${(sessionStorageSize / 1024).toFixed(2)}KB`);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };

    // Track initial page view
    handleRouteChange(router.pathname);

    // Subscribe to route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup subscription on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.pathname]);

  return (
    <>
      {/* Show global page loader during route changes */}
      {/* {loading && <PageLoader />} */}
      <Component {...pageProps} />
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <LoadingProvider>
            <OnboardingProvider>
              <AppInner Component={Component} pageProps={pageProps} />
            </OnboardingProvider>
          </LoadingProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
