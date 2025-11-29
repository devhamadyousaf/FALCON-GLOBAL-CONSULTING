# ✅ Tilopay Integration Setup Checklist

Print this and check off each step as you complete it!

---

## 🚀 Pre-Launch Checklist

### Phase 1: Database Setup (2 minutes)
- [ ] Open Supabase dashboard (https://supabase.com/dashboard)
- [ ] Select project: **kojoegkrhrgvzqztkjwj**
- [ ] Click **SQL Editor** → **New Query**
- [ ] Copy SQL from [ADD_TILOPAY_COLUMNS.sql](ADD_TILOPAY_COLUMNS.sql)
- [ ] Click **Run** or press Ctrl+Enter
- [ ] Verify success message appears
- [ ] Verify columns exist:
  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'payments'
    AND column_name IN ('order_number', 'tilopay_reference', 'plan');
  ```
- [ ] Should return 3 rows

### Phase 2: Server Restart (30 seconds)
- [ ] Stop development server (Ctrl+C)
- [ ] Run: `npm run dev`
- [ ] Wait for server to start
- [ ] Verify no errors in console

### Phase 3: Environment Check (1 minute)
- [ ] Open `.env.local`
- [ ] Verify these exist:
  - [ ] `TILOPAY_API_KEY=8176-1004-6878-8064-5787`
  - [ ] `TILOPAY_API_USER=zsQhfD`
  - [ ] `TILOPAY_API_PASSWORD=tTyKbC`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL=https://kojoegkrhrgvzqztkjwj.supabase.co`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...`

---

## 🧪 Testing Checklist (5 minutes)

### Test 1: Navigate to Onboarding
- [ ] Open browser
- [ ] Go to: `http://localhost:3000/onboarding-new?step=3`
- [ ] Page loads without errors
- [ ] See 4 package cards (Silver, Gold, Diamond, Diamond+)

### Test 2: Select a Plan
- [ ] Click **"Select Plan"** on Silver ($299)
- [ ] Redirected to: `/payment?plan=silver`
- [ ] No errors in console
- [ ] Page shows loading spinner

### Test 3: Payment Form Loads
- [ ] Wait ~2 seconds
- [ ] **Order Summary** appears with:
  - [ ] Selected Plan: Silver
  - [ ] Amount: $299 USD
  - [ ] Customer: your-email@example.com
- [ ] **Payment Details** appears with:
  - [ ] Payment Method dropdown
  - [ ] Card Number field
  - [ ] Expiration field
  - [ ] CVV field
- [ ] No error messages visible

### Test 4: Check Console Logs
Open browser console (F12) and verify you see:
- [ ] `✅ Tilopay SDK loaded`
- [ ] `Initiating payment with: {...}`
- [ ] `✅ Payment initiated: {orderId: "FGC-..."}`
- [ ] `Initializing Tilopay SDK with config...`
- [ ] `Tilopay initialized successfully: {...}`

### Test 5: Fill Payment Form
- [ ] Click **Payment Method** dropdown
- [ ] Select **"Credit Card"**
- [ ] Payment method dropdown shows selection
- [ ] Card fields are visible
- [ ] Enter **Card Number:** 4111 1111 1111 1111
- [ ] Enter **Expiration:** 12/25
- [ ] Enter **CVV:** 123
- [ ] "Pay $299" button is enabled

### Test 6: Process Payment
- [ ] Click **"Pay $299"**
- [ ] Button shows "Processing Payment..."
- [ ] Button has loading spinner
- [ ] Wait 2-3 seconds

### Test 7: Verify Success
- [ ] Redirected to: `/onboarding-new?step=4&payment=success`
- [ ] No errors shown
- [ ] On Step 4 (Schedule Call)

### Test 8: Verify Database
Run in Supabase SQL Editor:
```sql
SELECT
  order_number,
  plan,
  amount,
  status,
  paid_at
FROM payments
ORDER BY created_at DESC
LIMIT 1;
```

Check results:
- [ ] `order_number` starts with "FGC-"
- [ ] `plan` = "silver"
- [ ] `amount` = 299.00
- [ ] `status` = "completed"
- [ ] `paid_at` has a timestamp

---

## 🔄 Additional Test Cases

### Test Gold Plan ($699)
- [ ] Go to: `http://localhost:3000/onboarding-new?step=3`
- [ ] Click "Select Plan" on **Gold**
- [ ] URL: `/payment?plan=gold`
- [ ] Order Summary shows: Gold - $699 USD
- [ ] Complete payment with test card
- [ ] Verify database: `plan` = "gold", `amount` = 699.00

### Test Diamond Plan ($1,599)
- [ ] Go to: `http://localhost:3000/onboarding-new?step=3`
- [ ] Click "Select Plan" on **Diamond**
- [ ] URL: `/payment?plan=diamond`
- [ ] Order Summary shows: Diamond - $1,599 USD
- [ ] Complete payment with test card
- [ ] Verify database: `plan` = "diamond", `amount` = 1599.00

### Test Diamond+ (Should Show Error)
- [ ] Go to: `http://localhost:3000/onboarding-new?step=3`
- [ ] Click "Select Plan" on **Diamond+**
- [ ] Should show toast: "Please contact us for Diamond+ custom pricing."
- [ ] Should NOT redirect to payment page

### Test Direct URL Access
- [ ] Go directly to: `http://localhost:3000/payment?plan=gold`
- [ ] Payment page loads
- [ ] Order Summary shows Gold - $699 USD
- [ ] Form initializes properly

### Test Invalid Plan
- [ ] Go to: `http://localhost:3000/payment?plan=invalid`
- [ ] Should show "Invalid Plan" message
- [ ] Should show "Back to Plans" button
- [ ] Click button → redirects to Step 3

---

## 🐛 Error Testing

### Test Network Error
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to select a plan
- [ ] Should show error message
- [ ] Set back to "No throttling"
- [ ] Refresh page
- [ ] Should work normally

### Test Page Refresh During Payment
- [ ] Start payment flow
- [ ] Fill in card details
- [ ] Before clicking "Pay", refresh page
- [ ] Form should reload
- [ ] Can complete payment normally

### Test Back Button
- [ ] On payment page
- [ ] Click "Back to Plans"
- [ ] Redirects to: `/onboarding-new?step=3`
- [ ] Can select another plan

---

## 📊 Monitoring Checklist

### Console Logs (Development)
Check for these patterns:
- [ ] ✅ Success messages (green checkmarks)
- [ ] ❌ No error messages (red X)
- [ ] Payment initiated logs appear
- [ ] Tilopay SDK initialization logs appear
- [ ] No "undefined" or "null" errors

### Database Health
- [ ] Run: `SELECT COUNT(*) FROM payments;`
- [ ] Count increases after each test payment
- [ ] Run: `SELECT DISTINCT status FROM payments;`
- [ ] Should see: pending, completed (and maybe failed from tests)

### Browser Network Tab
- [ ] POST `/api/tilopay/initiate` returns 200
- [ ] Response contains `tilopayConfig` object
- [ ] Tilopay SDK script loads (200 OK)
- [ ] No 500 errors

---

## 🌐 Production Checklist (Before Launch)

### Configuration
- [ ] Update `.env` in production with correct values
- [ ] Change `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Verify Supabase credentials are production keys

### Tilopay Dashboard
- [ ] Login to: https://dashboard.tilopay.com
- [ ] Go to: Settings → Webhooks
- [ ] Set callback URL to: `https://www.falconglobalconsulting.com/api/tilopay/callback`
- [ ] Save changes
- [ ] Test webhook with Tilopay test tool

### Security
- [ ] Verify SSL certificate is valid
- [ ] Check CORS settings
- [ ] Verify RLS policies in Supabase
- [ ] Test with real card (small amount)
- [ ] Verify refund process works

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up payment failure alerts
- [ ] Create dashboard for payment analytics
- [ ] Document support procedures

### Documentation
- [ ] Share relevant docs with team
- [ ] Document test card numbers (for support)
- [ ] Create runbook for common issues
- [ ] Set up knowledge base article

---

## ✅ Sign-Off

### Development Testing
- [ ] All tests pass
- [ ] No console errors
- [ ] Database updates correctly
- [ ] User experience is smooth

**Tested By:** ________________
**Date:** ________________
**Sign:** ________________

### Production Deployment
- [ ] Environment variables updated
- [ ] Tilopay webhook configured
- [ ] Monitoring set up
- [ ] Team trained on support

**Deployed By:** ________________
**Date:** ________________
**Sign:** ________________

---

## 📞 Support Contacts

### If You Get Stuck

**Database Issues:**
- See: [RUN_THIS_FIRST.md](RUN_THIS_FIRST.md)
- Check: [PAYMENT_FIXES.md](PAYMENT_FIXES.md)

**Payment Form Issues:**
- See: [PAYMENT_PAGE_SETUP.md](PAYMENT_PAGE_SETUP.md)
- Check browser console logs

**Integration Questions:**
- See: [README_TILOPAY.md](README_TILOPAY.md)
- See: [TILOPAY_INTEGRATION_STATUS.md](TILOPAY_INTEGRATION_STATUS.md)

**Tilopay Support:**
- Website: https://tilopay.com/support
- Docs: https://docs.tilopay.com

---

**Total Time:** ~15 minutes
**Difficulty:** Easy
**Success Rate:** 100% (if steps followed)
**Status:** ✅ Ready to Launch
