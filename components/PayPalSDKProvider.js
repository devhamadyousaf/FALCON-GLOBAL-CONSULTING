import React, { createContext, useContext, useState, useEffect } from 'react';
import Script from 'next/script';

/**
 * PayPal SDK Context
 * Provides PayPal SDK loading state and access to SDK
 */
const PayPalSDKContext = createContext({
  isLoaded: false,
  isLoading: false,
  error: null,
  paypal: null,
});

export const usePayPalSDK = () => useContext(PayPalSDKContext);

/**
 * PayPal SDK Provider Component
 * Loads PayPal JavaScript SDK and provides it to child components
 */
export const PayPalSDKProvider = ({ children, clientId, currency = 'USD', intent = 'subscription' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paypal, setPaypal] = useState(null);

  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=${intent}&currency=${currency}&components=buttons,marks`;

  useEffect(() => {
    // Check if SDK already loaded
    if (window.paypal) {
      setPaypal(window.paypal);
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, []);

  const handleLoad = () => {
    if (window.paypal) {
      setPaypal(window.paypal);
      setIsLoaded(true);
      setIsLoading(false);
      console.log('✅ PayPal SDK loaded successfully');
    } else {
      setError('PayPal SDK not found after loading');
      setIsLoading(false);
      console.error('❌ PayPal SDK not found');
    }
  };

  const handleError = () => {
    setError('Failed to load PayPal SDK');
    setIsLoading(false);
    console.error('❌ Failed to load PayPal SDK');
  };

  return (
    <>
      <Script
        src={sdkUrl}
        onLoad={handleLoad}
        onError={handleError}
        strategy="afterInteractive"
      />
      <PayPalSDKContext.Provider
        value={{
          isLoaded,
          isLoading,
          error,
          paypal,
        }}
      >
        {children}
      </PayPalSDKContext.Provider>
    </>
  );
};

export default PayPalSDKProvider;
