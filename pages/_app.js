import "@/styles/globals.css";
import { AuthProvider } from '../context/AuthContext';
import { OnboardingProvider } from '../context/OnboardingContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Component {...pageProps} />
      </OnboardingProvider>
    </AuthProvider>
  );
}
