# PayPal Integration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up PayPal recurring payments as your primary payment gateway.

---

## Step 1: Get PayPal Credentials (2 minutes)

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Log in or create an account
3. Navigate to **"Apps & Credentials"**
4. Click **"Create App"**
5. Copy your **Client ID** and **Client Secret**

---

## Step 2: Configure Environment Variables (1 minute)

Create or update `.env.local`:

```bash
# PayPal Credentials (use sandbox for testing)
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
PAYPAL_MODE=sandbox

# Frontend SDK
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id_here

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keep your existing Tilopay credentials
TILOPAY_API_KEY=your_tilopay_key
TILOPAY_API_USER=your_tilopay_user
TILOPAY_API_PASSWORD=your_tilopay_password
```

---

## Step 3: Run Database Migration (1 minute)

```bash
# Option 1: Using Supabase SQL Editor
# Copy contents of ADD_PAYPAL_COLUMNS.sql
# Paste into Supabase SQL Editor
# Click "Run"

# Option 2: Using CLI
supabase db push
```

---

## Step 4: Start Your Server (30 seconds)

```bash
npm install
npm run dev
```

---

## Step 5: Test the Payment Flow (1 minute)

1. Go to `http://localhost:3000/onboarding-new`
2. Complete steps 1-2 (destination & personal details)
3. On step 3, select any plan
4. You'll see the unified payment page with:
   - ✅ **PayPal** button (primary)
   - ✅ **Tilopay** option (fallback)
5. Click "Subscribe with PayPal"
6. Use PayPal sandbox test account to complete payment

---

## 🎯 Test Accounts

### PayPal Sandbox Test Accounts

Create test accounts at [PayPal Sandbox](https://developer.paypal.com/dashboard/accounts):

**Personal (Buyer) Account**:
- Email: `buyer@example.com`
- Password: `Test1234`

**Test Credit Cards**:
- Visa: `4032039603883434`
- Mastercard: `5425233430109903`
- CVV: `123`
- Expiry: `12/2030`

---

## ✅ Verify Integration

After completing a test payment, verify:

1. **Database Record**:
   ```sql
   SELECT * FROM payments
   WHERE payment_method = 'paypal'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

2. **Onboarding Progress**:
   - User should be redirected to step 4 (Schedule Call)
   - Payment status should show as completed

3. **PayPal Dashboard**:
   - Check sandbox transactions
   - Verify payment method token created

---

## 🔄 Switch to Production

When ready to go live:

1. Create a **production** PayPal app
2. Update `.env.local`:
   ```bash
   PAYPAL_MODE=production
   PAYPAL_CLIENT_ID=production_client_id
   PAYPAL_CLIENT_SECRET=production_secret
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=production_client_id
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```
3. Deploy your application
4. Test with a real PayPal account

---

## 🆘 Quick Troubleshooting

### Issue: PayPal button not showing
**Fix**: Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set correctly

### Issue: "Invalid credentials" error
**Fix**: Verify `PAYPAL_MODE` matches your credentials (sandbox/production)

### Issue: Payment stuck on "pending"
**Fix**: Check server logs and database metadata field

### Issue: Fallback not working
**Fix**: Ensure Tilopay credentials are still configured

---

## 📚 Full Documentation

For detailed information, see [README_PAYPAL_INTEGRATION.md](./README_PAYPAL_INTEGRATION.md)

---

## 🎉 You're Done!

Your payment system now uses:
- ✅ PayPal as primary gateway
- ✅ Tilopay as automatic fallback
- ✅ Recurring monthly subscriptions
- ✅ Secure payment method tokens

**Need Help?** Check the full documentation or contact support.
