// Google Analytics / Google Ads Tracking
export const GA_MEASUREMENT_ID = 'AW-17720879879';

// Track page views
export const pageview = (url) => {
  console.log('📊 Google Tag - Page view tracked:', url);
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  } else {
    console.warn('⚠️ gtag not loaded (this is normal on localhost)');
  }
};

// Track custom events
// Usage: event('button_click', { category: 'engagement', label: 'signup_button' })
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('📊 Google Tag - Event tracked:', action, { category, label, value });
  }
};

// Track conversions (for Google Ads)
// Usage: conversion('AW-CONVERSION-ID', 'AW-CONVERSION-LABEL')
export const conversion = (conversionId, conversionLabel, value = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${conversionId}/${conversionLabel}`,
      value: value,
      currency: 'USD',
    });
    console.log('📊 Google Tag - Conversion tracked:', conversionId, conversionLabel, value);
  }
};

// Track signup conversion
export const trackSignup = () => {
  event({
    action: 'sign_up',
    category: 'engagement',
    label: 'user_signup',
  });
};

// Track payment completion
export const trackPurchase = (planName, amount) => {
  event({
    action: 'purchase',
    category: 'ecommerce',
    label: planName,
    value: amount,
  });

  // Also track as conversion for Google Ads
  // You'll need to replace these with your actual conversion IDs from Google Ads
  // conversion('AW-17720879879', 'YOUR_CONVERSION_LABEL', amount);
};

// Track onboarding completion
export const trackOnboardingComplete = () => {
  event({
    action: 'onboarding_complete',
    category: 'engagement',
    label: 'user_onboarding',
  });
};

// Track affiliate link clicks
export const trackAffiliateClick = (serviceName) => {
  event({
    action: 'affiliate_click',
    category: 'affiliate',
    label: serviceName,
  });
};
