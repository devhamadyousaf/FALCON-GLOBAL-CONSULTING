# PayPal Integration Setup Checklist

Use this checklist to ensure your PayPal integration is fully configured and tested.

---

## 📋 Pre-Setup

- [ ] Review [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) for overview
- [ ] Read [PAYPAL_QUICK_START.md](./PAYPAL_QUICK_START.md) for quick setup
- [ ] Have access to PayPal Developer account
- [ ] Have access to Supabase database
- [ ] Have access to your `.env.local` file

---

## 🔐 PayPal Developer Setup

### Sandbox Configuration

- [ ] Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
- [ ] Create or log into your developer account
- [ ] Navigate to "Apps & Credentials"
- [ ] Switch to "Sandbox" mode
- [ ] Click "Create App"
- [ ] Name your app (e.g., "FALCON Global Consulting - Sandbox")
- [ ] Select app type: "Merchant"
- [ ] Copy **Sandbox Client ID** → Save for .env
- [ ] Click "Show" under Secret → Copy **Sandbox Secret** → Save for .env

### Sandbox Test Accounts

- [ ] Go to "Sandbox" → "Accounts"
- [ ] Create a **Personal** test account (buyer)
  - [ ] Email: `buyer@example.com` (or auto-generated)
  - [ ] Password: `Test1234` (or auto-generated)
  - [ ] Save credentials for testing
- [ ] Verify **Business** test account exists (seller)

### App Configuration

- [ ] In your app settings, verify these features are enabled:
  - [ ] Accept payments
  - [ ] Vault (for storing payment methods)
  - [ ] Subscriptions
- [ ] Note your app's **Return URL** capability
- [ ] Save all changes

---

## ⚙️ Environment Configuration

### Update .env.local

- [ ] Open `.env.local` file (create if it doesn't exist)
- [ ] Add/update PayPal configuration:

```bash
# PayPal Sandbox Configuration
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
PAYPAL_MODE=sandbox

# Frontend SDK
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# Site URL (development)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] Verify existing Tilopay credentials are present:

```bash
# Tilopay Configuration (Fallback)
TILOPAY_API_KEY=your_tilopay_key
TILOPAY_API_USER=your_tilopay_user
TILOPAY_API_PASSWORD=your_tilopay_password
```

- [ ] Verify Supabase credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- [ ] Save file
- [ ] Restart development server

---

## 🗄️ Database Migration

### Run SQL Migration

- [ ] Open Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Open `ADD_PAYPAL_COLUMNS.sql` file
- [ ] Copy entire contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" or press Ctrl+Enter
- [ ] Verify no errors in output

### Verify Migration

- [ ] Run verification query:

```sql
-- Check new column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments'
AND column_name = 'paypal_reference';

-- Should return: paypal_reference | text
```

- [ ] Check helper functions:

```sql
-- Test function
SELECT public.has_active_paypal_subscription('00000000-0000-0000-0000-000000000000');

-- Should return: false (or true if subscriptions exist)
```

- [ ] Check views:

```sql
-- Test view
SELECT * FROM public.active_paypal_subscriptions LIMIT 1;

-- Should return columns without error
```

---

## 💻 Local Development Setup

### Install Dependencies

- [ ] Open terminal in project root
- [ ] Run: `npm install` (or `yarn install`)
- [ ] Wait for installation to complete
- [ ] Verify no errors

### Start Development Server

- [ ] Run: `npm run dev` (or `yarn dev`)
- [ ] Wait for server to start
- [ ] Verify server running at `http://localhost:3000`
- [ ] Check console for any startup errors

### Verify Components Loaded

- [ ] Check browser console for errors
- [ ] Verify no build errors in terminal
- [ ] Check that all pages load without 404 errors

---

## 🧪 Testing - PayPal Flow

### Test Payment Flow

- [ ] Navigate to `http://localhost:3000/onboarding-new`
- [ ] Log in or create test account
- [ ] Complete Step 1: Select destination (GCC or Europe)
- [ ] Complete Step 2: Enter personal details
- [ ] If Europe selected, complete Step 2.5: Visa check
- [ ] Arrive at Step 3: Payment/Plan selection

### Test Unified Payment Page

- [ ] Select any plan (e.g., Gold - $699)
- [ ] Verify redirect to `/payment-unified?plan=gold`
- [ ] Check page loads without errors
- [ ] Verify plan details display correctly
- [ ] Verify billing information shows

### Test PayPal Gateway

- [ ] Verify "PayPal" button is visible
- [ ] Verify "Tilopay (Backup)" button is visible
- [ ] Verify PayPal is selected by default (blue highlight)
- [ ] Check subscription summary displays:
  - [ ] Plan name
  - [ ] Monthly billing
  - [ ] Amount
  - [ ] Setup fee
  - [ ] Total today
- [ ] Read subscription details (12 months, cancel anytime)
- [ ] Click "Subscribe with PayPal" button

### Test PayPal Redirect

- [ ] Wait for redirect to PayPal
- [ ] Verify PayPal login page loads
- [ ] Log in with sandbox **Personal** test account
- [ ] Review subscription agreement:
  - [ ] Verify plan name
  - [ ] Verify amount
  - [ ] Verify billing frequency
- [ ] Click "Agree & Subscribe" or equivalent
- [ ] Wait for redirect back to your site

### Verify Payment Success

- [ ] Verify redirect to `/onboarding-new?step=4&payment=success&code=1`
- [ ] Check success toast/message appears
- [ ] Verify step 4 (Schedule Call) is now active
- [ ] Check payment step (3) is marked complete

### Verify Database Records

- [ ] Open Supabase dashboard
- [ ] Go to Table Editor → `payments`
- [ ] Find latest payment record
- [ ] Verify:
  - [ ] `payment_method` = "paypal"
  - [ ] `status` = "completed"
  - [ ] `amount` = correct amount
  - [ ] `currency` = "USD"
  - [ ] `paypal_reference` has value
  - [ ] `transaction_id` has value
  - [ ] `paid_at` has timestamp
  - [ ] `metadata` contains PayPal details

- [ ] Go to Table Editor → `onboarding_data`
- [ ] Find user's record
- [ ] Verify:
  - [ ] `payment_completed` = true
  - [ ] `payment_details` contains plan info

---

## 🔄 Testing - Tilopay Fallback

### Simulate PayPal Failure

- [ ] Stop development server
- [ ] Edit `.env.local`
- [ ] Set invalid PayPal credentials:

```bash
PAYPAL_CLIENT_ID=invalid_test_id
```

- [ ] Save file
- [ ] Restart development server

### Test Automatic Fallback

- [ ] Go to onboarding step 3
- [ ] Select a plan
- [ ] On payment page, verify:
  - [ ] PayPal shows as "unavailable"
  - [ ] Tilopay is automatically selected
  - [ ] Yellow warning message displays
  - [ ] Tilopay payment form shows

### Test Manual Gateway Switch

- [ ] Restore valid PayPal credentials
- [ ] Restart server
- [ ] Go to payment page
- [ ] Click "Tilopay (Backup)" button
- [ ] Verify:
  - [ ] Gateway switches to Tilopay
  - [ ] Tilopay payment form appears
  - [ ] Can switch back to PayPal

---

## ✅ Production Readiness

### Before Going Live

- [ ] All sandbox tests pass
- [ ] PayPal sandbox account works correctly
- [ ] Tilopay fallback tested
- [ ] Database records verified
- [ ] Error handling tested
- [ ] Mobile responsiveness checked

### Production PayPal Setup

- [ ] Go to PayPal Developer Dashboard
- [ ] Switch to "Live" mode
- [ ] Create production app
- [ ] Copy **Live Client ID**
- [ ] Copy **Live Secret**
- [ ] Enable required features (payments, vault, subscriptions)

### Production Environment Variables

- [ ] Update production `.env` file:

```bash
PAYPAL_CLIENT_ID=live_client_id_here
PAYPAL_CLIENT_SECRET=live_secret_here
PAYPAL_MODE=production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=live_client_id_here
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Production Testing

- [ ] Deploy to production
- [ ] Test with real PayPal account
- [ ] Use small amount first ($1 test)
- [ ] Verify redirect URLs work
- [ ] Check database records
- [ ] Test subscription appears in PayPal account
- [ ] Verify cancellation works

---

## 📊 Monitoring Setup

### Metrics to Track

- [ ] Set up monitoring for:
  - [ ] Payment success rate
  - [ ] PayPal vs Tilopay usage
  - [ ] Fallback trigger frequency
  - [ ] Average payment completion time
  - [ ] Error rates by gateway

### Alerts to Configure

- [ ] Set up alerts for:
  - [ ] High payment failure rate (>10%)
  - [ ] PayPal gateway unavailable
  - [ ] Database connection errors
  - [ ] Webhook failures (if configured)

---

## 📚 Documentation Review

- [ ] Team reviewed [PAYPAL_QUICK_START.md](./PAYPAL_QUICK_START.md)
- [ ] Team reviewed [README_PAYPAL_INTEGRATION.md](./README_PAYPAL_INTEGRATION.md)
- [ ] Team reviewed [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- [ ] Support team trained on new payment flow
- [ ] Troubleshooting guide accessible

---

## 🎉 Launch Checklist

### Final Verification

- [ ] All tests pass in sandbox
- [ ] Production credentials configured
- [ ] DNS and SSL configured
- [ ] Database backed up
- [ ] Monitoring enabled
- [ ] Team notified of launch
- [ ] Support ready for questions

### Post-Launch

- [ ] Monitor first 10 payments closely
- [ ] Check error logs regularly
- [ ] Verify subscription renewals work
- [ ] Gather user feedback
- [ ] Document any issues

---

## 📝 Notes

Use this space for any custom notes or issues encountered:

```
Date: ___________
Issue: ___________________________________________________________
Resolution: _______________________________________________________

Date: ___________
Issue: ___________________________________________________________
Resolution: _______________________________________________________
```

---

## ✅ Sign-Off

### Development Team

- [ ] Backend integration complete
- [ ] Frontend components complete
- [ ] Database migration successful
- [ ] Testing complete
- [ ] Documentation complete

**Completed by**: _________________ **Date**: _________

### QA Team

- [ ] Sandbox testing complete
- [ ] Production testing complete
- [ ] Edge cases tested
- [ ] Security reviewed

**Completed by**: _________________ **Date**: _________

### Product Owner

- [ ] Requirements met
- [ ] User experience approved
- [ ] Ready for production

**Approved by**: _________________ **Date**: _________

---

**Status**: Ready for Implementation ✅

**Last Updated**: December 4, 2025
