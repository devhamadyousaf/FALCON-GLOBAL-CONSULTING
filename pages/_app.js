import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { OnboardingProvider } from '../context/OnboardingContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { LoadingProvider, useLoading } from '../context/LoadingContext';
import PageLoader from '../components/PageLoader';
import { ToastProvider } from '../context/ToastContext';

function AppInner({ Component, pageProps }) {
  const { loading } = useLoading();

  return (
    <>
      {/* Show global page loader during route changes */}
      {loading && <PageLoader />}
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
