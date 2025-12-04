/**
 * PayPal SDK Configuration
 * Server-side PayPal SDK setup and utilities
 */

const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * Get PayPal environment (Sandbox or Live)
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (mode === 'production') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

/**
 * Get PayPal HTTP client
 */
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 * Get PayPal API base URL
 */
function getApiBase() {
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  return mode === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

/**
 * Get PayPal access token using SDK
 */
async function getAccessToken() {
  try {
    const paypalClient = client();
    const request = new checkoutNodeJssdk.core.AccessTokenRequest(environment());
    const response = await paypalClient.execute(request);
    return response.result.access_token;
  } catch (error) {
    console.error('Failed to get PayPal access token:', error);
    throw error;
  }
}

/**
 * Make authenticated request to PayPal API
 * (For endpoints not covered by the SDK)
 */
async function makeRequest(method, endpoint, body = null) {
  const accessToken = await getAccessToken();
  const apiBase = getApiBase();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${apiBase}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'PayPal API request failed');
  }

  return data;
}

module.exports = {
  client,
  environment,
  getAccessToken,
  getApiBase,
  makeRequest,
  checkoutNodeJssdk,
};
