import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    window.location.href = 'https://app.gohighlevel.com/v2/preview/fvmdp2hsRp5y3713c9Ue?notrack=true';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <p>Redirecting to landing page...</p>
    </div>
  );
}
