# PayPal Recurring Payments Integration Guide

## 🎯 Overview

This guide documents the integration of **PayPal as the primary payment gateway** with **Tilopay as a fallback** for FALCON Global Consulting's onboarding payment flow. The system supports **recurring monthly subscriptions** based on the pricing plans.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Features](#features)
3. [File Structure](#file-structure)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Payment Flow](#payment-flow)
7. [Database Schema](#database-schema)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Payment Gateway Priority

```
┌─────────────────────────────────────────┐
│         User Selects Plan               │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    Unified Payment Gateway Component    │
│  (PayPal Primary + Tilopay Fallback)    │
└────────────┬────────────────────────────┘
             │
             ├──► Try PayPal (Primary)
             │    ├──► Success ✅
             │    └──► Failure ❌
             │              │
             └──────────────┴──► Fallback to Tilopay
```

### Technology Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Payment Gateways**:
  - **Primary**: PayPal Recurring Payments (Payment Method Tokens v3 API)
  - **Fallback**: Tilopay SDK

---

## ✨ Features

### PayPal Integration
- ✅ Recurring monthly subscriptions
- ✅ Setup fee on first payment
- ✅ Secure payment method tokens
- ✅ Automatic billing on monthly basis
- ✅ User-managed subscriptions (cancel anytime from PayPal)
- ✅ Sandbox and production modes
- ✅ Customizable billing cycles

### Fallback System
- ✅ Automatic fallback to Tilopay on PayPal failure
- ✅ Manual gateway switching
- ✅ Gateway health monitoring
- ✅ Real-time status indicators

### User Experience
- ✅ Seamless payment flow
- ✅ Clear pricing display
- ✅ Subscription details preview
- ✅ Error handling with user-friendly messages
- ✅ Mobile-responsive design

---

## 📁 File Structure

```
FALCON-GLOBAL-CONSULTING/
│
├── pages/
│   ├── api/
│   │   ├── paypal/
│   │   │   ├── create-setup-token.js      # Creates PayPal setup token
│   │   │   ├── create-payment-token.js    # Converts setup token to payment token
│   │   │   ├── capture-payment.js         # Captures payment using token
│   │   │   └── callback.js                # Handles PayPal redirects
│   │   └── tilopay/
│   │       ├── initiate.js                # Existing Tilopay endpoints
│   │       ├── get-token.js
│   │       ├── callback.js
│   │       └── verify.js
│   │
│   ├── payment-unified.js                 # Unified payment page
│   ├── payment-tilopay.js                 # Legacy Tilopay-only page
│   └── onboarding-new.js                  # Updated to use unified payment
│
├── components/
│   ├── UnifiedPaymentGateway.js           # Main payment gateway component
│   ├── PayPalRecurringPayment.js          # PayPal-specific component
│   ├── TilopayPaymentForm.js              # Existing Tilopay component
│   └── TilopayPayment.js
│
├── ADD_PAYPAL_COLUMNS.sql                 # Database migration
├── .env.example                           # Updated with PayPal config
└── README_PAYPAL_INTEGRATION.md           # This file
```

---

## 🚀 Setup Instructions

### Step 1: PayPal Developer Account Setup

1. **Create PayPal Developer Account**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
   - Sign up or log in with your PayPal account

2. **Create an App**
   - Navigate to "Apps & Credentials"
   - Click "Create App"
   - Choose "Merchant" as app type
   - Enable these features:
     - ✅ Accept payments
     - ✅ Vault
     - ✅ Subscriptions

3. **Get Credentials**
   - Copy your **Client ID**
   - Copy your **Client Secret**
   - Note: Start with **Sandbox** credentials for testing

### Step 2: Environment Variables

Create or update your `.env.local` file:

```bash
# PayPal Configuration (Primary Payment Gateway)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_MODE=sandbox

# For frontend PayPal SDK
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id

# Tilopay Configuration (Fallback)
TILOPAY_API_KEY=your_tilopay_key
TILOPAY_API_USER=your_tilopay_user
TILOPAY_API_PASSWORD=your_tilopay_password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Database Migration

Run the SQL migration to add PayPal support:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL file
psql -h your_host -U your_user -d your_db -f ADD_PAYPAL_COLUMNS.sql
```

The migration adds:
- `paypal_reference` column to payments table
- Indexes for performance
- Database functions for subscription management
- Views for active subscriptions

### Step 4: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 5: Start Development Server

```bash
npm run dev
# or
yarn dev
```

---

## 🔌 API Endpoints

### 1. Create Setup Token
**Endpoint**: `POST /api/paypal/create-setup-token`

Creates a PayPal setup token for recurring payments.

**Request Body**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "amount": 699,
  "planName": "Gold",
  "currency": "USD",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "US",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "setupTokenId": "7N123456ABCDEFGH",
  "paymentId": "payment-uuid",
  "orderNumber": "FGC-PP-1234567890-abc123",
  "approvalUrl": "https://www.paypal.com/checkoutnow?token=..."
}
```

### 2. Create Payment Token
**Endpoint**: `POST /api/paypal/create-payment-token`

Converts setup token to payment method token after user approval.

**Request Body**:
```json
{
  "setupTokenId": "7N123456ABCDEFGH",
  "paymentId": "payment-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "paymentTokenId": "8P987654ZYXWVUTS",
  "tokenData": {
    "id": "8P987654ZYXWVUTS",
    "customer": { "id": "customer-id" },
    "payment_source": { ... }
  }
}
```

### 3. Capture Payment
**Endpoint**: `POST /api/paypal/capture-payment`

Captures payment using payment method token.

**Request Body**:
```json
{
  "paymentId": "payment-uuid",
  "paymentTokenId": "8P987654ZYXWVUTS",
  "amount": 699,
  "currency": "USD"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "9AB12345CD67890",
  "captureId": "1EF23456GH78901"
}
```

### 4. Callback Handler
**Endpoint**: `GET /api/paypal/callback`

Handles redirect from PayPal after user approval.

**Query Parameters**:
- `token`: Setup token ID
- `paymentId`: Payment record UUID
- `orderNumber`: Order number

**Redirects to**:
- Success: `/onboarding-new?step=4&payment=success&code=1`
- Failure: `/onboarding-new?step=3&payment=failed&error=...`

---

## 🔄 Payment Flow

### Complete User Journey

```
1. User selects plan on onboarding (Step 3)
   └─► Redirects to /payment-unified?plan=gold

2. Unified Payment Gateway loads
   ├─► Attempts PayPal initialization
   │   ├─► Creates payment record in database
   │   ├─► Calls /api/paypal/create-setup-token
   │   └─► Displays "Subscribe with PayPal" button
   │
   └─► Fallback to Tilopay if PayPal fails

3. User clicks "Subscribe with PayPal"
   └─► Redirects to PayPal approval URL

4. User approves on PayPal
   ├─► Reviews subscription details
   ├─► Agrees to billing agreement
   └─► PayPal redirects to /api/paypal/callback?token=...

5. Callback handler processes approval
   ├─► Creates payment token from setup token
   ├─► Captures initial payment
   ├─► Updates database records
   └─► Redirects to /onboarding-new?step=4&payment=success

6. User continues onboarding
   └─► Payment is marked as completed
```

### Recurring Billing Flow

```
Initial Payment (Today)
   ├─► Setup fee: $699 (example)
   └─► Subscription created

Monthly Billing (Automatic)
   ├─► Day 1 of each month
   ├─► PayPal charges $699 automatically
   ├─► User receives receipt via PayPal
   └─► 12 total billing cycles
```

---

## 🗄️ Database Schema

### Payments Table Updates

```sql
-- New columns added
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS paypal_reference TEXT;

-- Stores PayPal payment token ID or subscription ID

-- Example payment record
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": 699.00,
  "currency": "USD",
  "payment_method": "paypal",
  "status": "completed",
  "transaction_id": "8P987654ZYXWVUTS",
  "paypal_reference": "8P987654ZYXWVUTS",
  "order_number": "FGC-PP-1701234567-abc123",
  "plan": "gold",
  "paid_at": "2025-12-04T12:00:00Z",
  "metadata": {
    "setupTokenId": "7N123456ABCDEFGH",
    "paymentTokenId": "8P987654ZYXWVUTS",
    "captureId": "1EF23456GH78901",
    "orderId": "9AB12345CD67890",
    "customerId": "CUST123456",
    "email": "user@example.com"
  }
}
```

### Onboarding Data Updates

```sql
-- payment_details field stores payment info
{
  "payment_completed": true,
  "payment_details": {
    "plan": "gold",
    "amount": 699,
    "currency": "USD",
    "gateway": "paypal",
    "transactionId": "1EF23456GH78901",
    "orderNumber": "FGC-PP-1701234567-abc123",
    "paymentTokenId": "8P987654ZYXWVUTS",
    "timestamp": "2025-12-04T12:00:00Z"
  }
}
```

### Helpful Database Functions

```sql
-- Check if user has active PayPal subscription
SELECT public.has_active_paypal_subscription('user-uuid');

-- Get user's latest PayPal payment
SELECT * FROM public.get_latest_paypal_payment('user-uuid');

-- View all active PayPal subscriptions
SELECT * FROM public.active_paypal_subscriptions;
```

---

## 🧪 Testing

### PayPal Sandbox Testing

1. **Create Test Accounts**
   - Go to [PayPal Sandbox](https://developer.paypal.com/dashboard/accounts)
   - Create a **Personal** account (buyer)
   - Create a **Business** account (merchant)

2. **Test Cards**
   PayPal provides test credit cards for sandbox:
   - Visa: `4032039603883434`
   - Mastercard: `5425233430109903`
   - CVV: Any 3 digits
   - Expiry: Any future date

3. **Test Payment Flow**
   ```bash
   # Start dev server
   npm run dev

   # Navigate to
   http://localhost:3000/onboarding-new

   # Complete steps 1-2
   # On step 3, select a plan
   # Click "Subscribe with PayPal"
   # Log in with test personal account
   # Approve subscription
   # Verify redirect to step 4
   ```

4. **Verify in Dashboard**
   - Check PayPal Sandbox Dashboard for test transactions
   - Check Supabase database for payment records

### Testing Fallback to Tilopay

1. **Simulate PayPal Failure**
   ```javascript
   // In .env.local, use invalid credentials
   PAYPAL_CLIENT_ID=invalid_id
   ```

2. **Verify Automatic Fallback**
   - Component should detect PayPal unavailable
   - Automatically switch to Tilopay
   - Display fallback notice to user

3. **Manual Gateway Switch**
   - Use the gateway switcher buttons
   - Test both PayPal and Tilopay flows

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] **Get Production PayPal Credentials**
  - Create production app in PayPal Dashboard
  - Enable live payments
  - Copy production Client ID and Secret

- [ ] **Update Environment Variables**
  ```bash
  PAYPAL_CLIENT_ID=production_client_id
  PAYPAL_CLIENT_SECRET=production_client_secret
  PAYPAL_MODE=production
  NEXT_PUBLIC_PAYPAL_CLIENT_ID=production_client_id
  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
  ```

- [ ] **Run Database Migrations**
  ```bash
  # Apply ADD_PAYPAL_COLUMNS.sql to production database
  ```

- [ ] **Test Production Flow**
  - Use real PayPal account
  - Test with small amount first
  - Verify database records
  - Check email notifications

- [ ] **Configure Webhooks (Optional)**
  - Set up PayPal webhooks for payment events
  - Handle subscription updates, cancellations, etc.

### Monitoring

Monitor these metrics:
- Payment success/failure rates
- Gateway availability
- Average payment completion time
- Fallback trigger frequency

---

## 🐛 Troubleshooting

### Common Issues

#### 1. PayPal Button Not Appearing

**Symptoms**: No "Subscribe with PayPal" button shows

**Solutions**:
```bash
# Check environment variables
echo $NEXT_PUBLIC_PAYPAL_CLIENT_ID

# Verify credentials are correct
# Check browser console for errors
# Ensure PAYPAL_MODE is set correctly
```

#### 2. "Failed to create PayPal setup token"

**Symptoms**: Error when initializing payment

**Solutions**:
- Verify PayPal credentials are valid
- Check PAYPAL_MODE (sandbox vs production)
- Ensure PayPal app has required permissions
- Check API response in server logs

#### 3. Callback Returns Error

**Symptoms**: Redirect from PayPal fails

**Solutions**:
- Check NEXT_PUBLIC_SITE_URL is correct
- Verify callback URL in PayPal app settings
- Check server logs for detailed error
- Ensure database connection is working

#### 4. Payment Marked as Pending

**Symptoms**: Payment doesn't complete

**Solutions**:
```sql
-- Check payment record
SELECT * FROM payments WHERE id = 'payment-uuid';

-- Check metadata for errors
SELECT metadata FROM payments WHERE id = 'payment-uuid';

-- Manually update if needed
UPDATE payments
SET status = 'completed', paid_at = NOW()
WHERE id = 'payment-uuid';
```

#### 5. Fallback Not Triggering

**Symptoms**: Page stuck on PayPal error

**Solutions**:
- Check UnifiedPaymentGateway error handling
- Verify Tilopay credentials
- Check browser console for JavaScript errors
- Test manual gateway switch

### Debug Mode

Enable detailed logging:

```javascript
// In UnifiedPaymentGateway.js
const DEBUG = true;

if (DEBUG) {
  console.log('Gateway status:', gatewayStatus);
  console.log('Active gateway:', activeGateway);
  console.log('Error:', error);
}
```

### Support Resources

- **PayPal Developer Forum**: [https://www.paypal-community.com/](https://www.paypal-community.com/)
- **PayPal API Reference**: [https://developer.paypal.com/api/rest/](https://developer.paypal.com/api/rest/)
- **Tilopay Support**: Contact your Tilopay representative

---

## 📊 Pricing Plans

Current subscription plans with recurring billing:

| Plan | Monthly Price | Features |
|------|--------------|----------|
| **Silver** | $299/month | Career consultation, CV review, basic support |
| **Gold** | $699/month | Full relocation assistance, priority support |
| **Diamond** | $1,599/month | End-to-end recruitment, dedicated manager, 24/7 support |
| **Diamond+** | Custom | Enterprise solutions, C-suite search, white-glove service |

All plans include:
- Initial setup fee (same as monthly price)
- 12-month billing cycle
- Cancel anytime from PayPal account
- Automatic monthly renewal

---

## 🔐 Security Considerations

- ✅ All payment data handled by PayPal/Tilopay (PCI-DSS compliant)
- ✅ No credit card numbers stored in database
- ✅ Payment tokens encrypted by PayPal
- ✅ HTTPS required for production
- ✅ Environment variables for sensitive data
- ✅ SQL injection protection via parameterized queries
- ✅ CSRF protection via Next.js API routes

---

## 📝 Maintenance

### Monthly Tasks
- [ ] Review payment success rates
- [ ] Check for failed subscriptions
- [ ] Monitor gateway availability
- [ ] Review error logs

### Quarterly Tasks
- [ ] Update PayPal SDK version
- [ ] Review and optimize database queries
- [ ] Analyze payment flow metrics
- [ ] Update documentation

---

## 🎉 Summary

You now have a fully integrated dual-gateway payment system with:
- ✅ PayPal as primary recurring payment gateway
- ✅ Tilopay as reliable fallback
- ✅ Seamless user experience
- ✅ Comprehensive error handling
- ✅ Database integration
- ✅ Production-ready code

For questions or issues, refer to the troubleshooting section or contact the development team.

---

**Last Updated**: December 4, 2025
**Version**: 1.0.0
**Author**: FALCON Global Consulting Development Team
