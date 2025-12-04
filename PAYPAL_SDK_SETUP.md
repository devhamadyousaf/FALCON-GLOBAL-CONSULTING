# PayPal SDK Integration - Complete Setup Guide

## 🎉 **What Changed**

Your PayPal integration now uses **BOTH** the official PayPal SDKs for a much better implementation:

- ✅ **PayPal JavaScript SDK** (client-side) - Modern embedded buttons
- ✅ **PayPal Node.js SDK** (server-side) - Clean, maintainable code

---

## 🚀 **Quick Start (5 Steps)**

### **Step 1: Install PayPal Node.js SDK**

```bash
npm install @paypal/checkout-server-sdk
```

Or with yarn:
```bash
yarn add @paypal/checkout-server-sdk
```

###  **Step 2: Configure Environment Variables**

Update your `.env.local`:

```bash
# PayPal Credentials (Sandbox for testing)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox

# Frontend SDK (same client ID)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id

# Keep your Tilopay credentials (fallback)
TILOPAY_API_KEY=your_tilopay_key
TILOPAY_API_USER=your_tilopay_user
TILOPAY_API_PASSWORD=your_tilopay_password

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### **Step 3: Run Database Migration**

The same migration from before still applies:

```bash
# Using Supabase SQL Editor
# Run: ADD_PAYPAL_COLUMNS.sql
```

### **Step 4: Start Development Server**

```bash
npm run dev
```

### **Step 5: Test the Flow**

1. Go to `http://localhost:3000/onboarding-new`
2. Complete steps 1-2
3. On step 3, select a plan
4. You'll see **modern PayPal buttons** embedded on the page
5. Click PayPal button → Complete subscription
6. Done!

---

## 📦 **What's New - SDK-Based Architecture**

### **Client-Side (JavaScript SDK)**

```
┌─────────────────────────────────────────┐
│    PayPalSDKProvider (Wrapper)          │
│  Loads: paypal.com/sdk/js?...          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  PayPalSubscriptionButtons Component    │
│  - Renders PayPal buttons               │
│  - Handles createSubscription           │
│  - Handles onApprove                    │
│  - NO page redirect!                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  User stays on your site                │
│  PayPal opens in modal/popup            │
│  Seamless experience                    │
└─────────────────────────────────────────┘
```

### **Server-Side (Node.js SDK)**

```javascript
// Before (Manual REST API calls)
const auth = Buffer.from(`${id}:${secret}`).toString('base64');
const response = await fetch(url, {
  headers: { Authorization: `Basic ${auth}` }
});

// After (Clean SDK usage)
import { client, makeRequest } from '@/lib/paypal-sdk';
const data = await makeRequest('POST', '/v1/billing/plans', payload);
```

---

## 🆕 **New Files Created**

| File | Purpose |
|------|---------|
| `lib/paypal-sdk.js` | Server-side SDK configuration & utilities |
| `components/PayPalSDKProvider.js` | JavaScript SDK loader (Context provider) |
| `components/PayPalSubscriptionButtons.js` | Smart PayPal buttons component |
| `api/paypal/create-plan.js` | Creates billing plans dynamically |
| `api/paypal/create-subscription.js` | Processes subscriptions from SDK |
| `INSTALL_PAYPAL_SDK.md` | Install instructions |
| `PAYPAL_SDK_SETUP.md` | This file |

---

## ✨ **Key Improvements**

### **Before (REST API Only)**

❌ User redirected away from your site
❌ Manual token management
❌ More complex error handling
❌ Separate approval flow

### **After (SDK-Based)**

✅ User stays on your site (modal/popup)
✅ Automatic token management
✅ Built-in error handling
✅ Seamless inline experience
✅ Modern PayPal branding
✅ Faster checkout
✅ Mobile-optimized

---

## 🔄 **How It Works Now**

### **1. PayPal Plan Creation (Automatic)**

```javascript
// Component automatically creates plans if they don't exist
const response = await fetch('/api/paypal/create-plan', {
  method: 'POST',
  body: JSON.stringify({
    planName: 'Gold',
    amount: 699,
    currency: 'USD',
  }),
});

// Returns: { planId: 'P-XXXXXXXXXXXX' }
```

### **2. PayPal Buttons Render**

```javascript
// PayPalSubscriptionButtons component
paypal.Buttons({
  createSubscription: (data, actions) => {
    return actions.subscription.create({
      plan_id: planId, // From step 1
    });
  },
  onApprove: async (data, actions) => {
    // Send to backend
    await fetch('/api/paypal/create-subscription', {
      body: JSON.stringify({
        subscriptionID: data.subscriptionID,
        userId, planName, amount, email,
      }),
    });
  },
}).render('#paypal-button-container');
```

### **3. Backend Processes Subscription**

```javascript
// api/paypal/create-subscription.js
const subscription = await makeRequest(
  'GET',
  `/v1/billing/subscriptions/${subscriptionID}`
);

// Save to database
await supabase.from('payments').insert({
  user_id: userId,
  amount: amount,
  payment_method: 'paypal',
  status: 'completed',
  transaction_id: subscriptionID,
  paypal_reference: subscriptionID,
  ...
});
```

---

## 🎯 **Benefits of SDK Approach**

### **For Developers**

- 🔧 **Cleaner Code**: SDK handles authentication automatically
- 🛠️ **Type Safety**: TypeScript definitions included
- 📚 **Better Documentation**: Official PayPal SDK docs
- 🐛 **Easier Debugging**: Built-in error handling
- ⚡ **Faster Development**: Less boilerplate code

### **For Users**

- 🖥️ **Better UX**: Stay on your site, no redirect
- ⚡ **Faster**: Modal opens instantly
- 📱 **Mobile-Optimized**: PayPal SDK handles responsive design
- 🎨 **Branded**: Official PayPal button styling
- 🔒 **Secure**: Official SDK, maintained by PayPal

---

## 📋 **Payment Flow Comparison**

### **Old Flow (REST API)**

```
User clicks button
  ↓
window.location.href = paypal.com/checkout?token=...
  ↓
User leaves your site ❌
  ↓
PayPal approval page
  ↓
PayPal redirects back
  ↓
Your callback endpoint processes
  ↓
Redirect to onboarding
```

### **New Flow (JavaScript SDK)**

```
User clicks PayPal button
  ↓
PayPal modal opens on your site ✅
  ↓
User approves in modal
  ↓
onApprove() callback fires immediately
  ↓
Backend processes subscription
  ↓
User continues on same page
```

---

## 🔌 **API Endpoints**

### **New Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/paypal/create-plan` | POST | Creates PayPal billing plan |
| `/api/paypal/create-subscription` | POST | Processes approved subscription |

### **Still Available (Legacy)**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/paypal/create-setup-token` | POST | Old REST API method |
| `/api/paypal/create-payment-token` | POST | Old REST API method |
| `/api/paypal/capture-payment` | POST | Old REST API method |
| `/api/paypal/callback` | GET | Old redirect handler |

---

## 🧪 **Testing**

### **1. Test PayPal Sandbox**

```bash
# Start server
npm run dev

# Navigate to onboarding
http://localhost:3000/onboarding-new

# Select a plan
# You should see PayPal buttons embedded on the page
```

### **2. Verify SDK Loading**

Open browser console, you should see:
```
✅ PayPal SDK loaded successfully
🎨 Rendering PayPal subscription buttons...
✅ PayPal buttons rendered successfully
```

### **3. Test Subscription**

1. Click PayPal button
2. PayPal modal should open (not redirect)
3. Log in with sandbox account
4. Approve subscription
5. Modal closes, backend processes
6. Check database for new payment record

### **4. Verify Database**

```sql
SELECT * FROM payments
WHERE payment_method = 'paypal'
ORDER BY created_at DESC
LIMIT 1;

-- Should show:
-- status: 'completed'
-- paypal_reference: subscription ID
-- transaction_id: subscription ID
```

---

## 🔧 **Configuration Options**

### **Plan IDs (Optional)**

You can pre-create plans in PayPal Dashboard and use them:

```bash
# .env.local
NEXT_PUBLIC_PAYPAL_PLAN_SILVER=P-1234567890ABCDEFG
NEXT_PUBLIC_PAYPAL_PLAN_GOLD=P-ABCDEFG1234567890
NEXT_PUBLIC_PAYPAL_PLAN_DIAMOND=P-9876543210ZYXWVUT
NEXT_PUBLIC_PAYPAL_PLAN_DIAMOND_PLUS=P-CUSTOM123456789
```

If not provided, plans are created automatically via API.

### **PayPal Button Styling**

Customize in `PayPalSubscriptionButtons.js`:

```javascript
paypal.Buttons({
  style: {
    shape: 'rect',      // 'rect' or 'pill'
    color: 'gold',      // 'gold', 'blue', 'silver', 'white', 'black'
    layout: 'vertical', // 'vertical' or 'horizontal'
    label: 'subscribe', // 'subscribe', 'checkout', 'buynow', 'pay', 'installment'
  },
  // ...
});
```

---

## 🚨 **Troubleshooting**

### **Issue: PayPal buttons not appearing**

**Check:**
1. `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
2. Browser console for SDK errors
3. PayPal SDK loaded (check Network tab)

**Fix:**
```bash
# Verify env variable
echo $NEXT_PUBLIC_PAYPAL_CLIENT_ID

# Restart server
npm run dev
```

### **Issue: "Plan not found" error**

**Cause:** Plan creation failed or Plan ID invalid

**Fix:**
```javascript
// Check api/paypal/create-plan.js logs
// Or create plan manually in PayPal Dashboard
```

### **Issue: Subscription not completing**

**Check:**
1. Backend `/api/paypal/create-subscription` logs
2. Database connection working
3. Supabase credentials correct

**Fix:**
```javascript
// Add console.logs in create-subscription.js
console.log('Subscription data:', subscriptionData);
console.log('Database insert result:', payment);
```

---

## 📚 **Resources**

- **PayPal JavaScript SDK**: [https://developer.paypal.com/sdk/js/](https://developer.paypal.com/sdk/js/)
- **PayPal Node.js SDK**: [https://github.com/paypal/Checkout-NodeJS-SDK](https://github.com/paypal/Checkout-NodeJS-SDK)
- **Subscriptions API**: [https://developer.paypal.com/docs/subscriptions/](https://developer.paypal.com/docs/subscriptions/)
- **Billing Plans**: [https://developer.paypal.com/docs/subscriptions/integrate/](https://developer.paypal.com/docs/subscriptions/integrate/)

---

## ✅ **Checklist**

- [ ] Install `@paypal/checkout-server-sdk`
- [ ] Configure environment variables
- [ ] Run database migration
- [ ] Test PayPal button rendering
- [ ] Test subscription creation
- [ ] Verify database records
- [ ] Test fallback to Tilopay
- [ ] Check mobile responsiveness

---

## 🎉 **Summary**

Your PayPal integration is now using **official PayPal SDKs** for:

- ✅ Modern embedded PayPal buttons (JavaScript SDK)
- ✅ Clean server-side code (Node.js SDK)
- ✅ Automatic plan creation
- ✅ Seamless user experience (no redirect)
- ✅ Better error handling
- ✅ Mobile-optimized checkout

**Ready to test!** 🚀

Run `npm install @paypal/checkout-server-sdk` and start your server to see the new PayPal buttons in action.
