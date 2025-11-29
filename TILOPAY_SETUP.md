# Tilopay Payment Integration Setup Guide

## Overview

This guide will help you integrate Tilopay payment provider into your Falcon Global Consulting application.

## Prerequisites

- Tilopay merchant account
- API credentials from Tilopay dashboard
- Supabase database access
- Node.js and npm installed

## Step 1: Configure Environment Variables

1. Copy your Tilopay credentials to `.env.local`:

```bash
# Tilopay Configuration
TILOPAY_API_KEY=8176-1004-6878-8064-5787
TILOPAY_API_USER=zsQhfD
TILOPAY_API_PASSWORD=tTyKbC
```

2. Make sure your site URL is configured:

```bash
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# For local development:
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 2: Run Database Migration

Apply the payments table migration to your Supabase database:

```bash
# If using Supabase CLI
npx supabase db push

# Or manually run the SQL file in Supabase Dashboard
# File: supabase/migrations/20250126_create_payments_table.sql
```

This creates:
- `payments` table for transaction records
- Indexes for performance
- Row-Level Security (RLS) policies
- Automatic timestamp updates

## Step 3: Verify API Endpoints

The following API endpoints are now available:

### 1. Initiate Payment
**POST** `/api/tilopay/initiate`

Request body:
```json
{
  "userId": "user-uuid",
  "amount": 299,
  "planName": "silver",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "currency": "USD",
  "address": "123 Main St",
  "city": "San Jose",
  "country": "CR",
  "phone": "+506 1234-5678"
}
```

Response:
```json
{
  "success": true,
  "paymentId": "payment-uuid",
  "orderNumber": "FGC-1234567890-abcd1234",
  "tilopayConfig": { ... },
  "message": "Payment initiated successfully"
}
```

### 2. Callback/Webhook Handler
**POST/GET** `/api/tilopay/callback`

This endpoint handles:
- Tilopay payment callbacks (redirects)
- Webhook notifications
- Database updates
- User redirection

### 3. Verify Payment
**POST** `/api/tilopay/verify`

Request body:
```json
{
  "paymentId": "payment-uuid",
  "userId": "user-uuid"
}
```

Response:
```json
{
  "success": true,
  "status": "completed",
  "amount": 299,
  "plan": "silver",
  "transactionId": "TLPY-123456",
  "orderNumber": "FGC-1234567890-abcd1234"
}
```

## Step 4: Using the Payment Component

### Basic Usage

```jsx
import TilopayPayment from '../components/TilopayPayment';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

function PaymentPage() {
  const { user } = useAuth();
  const { onboardingData } = useOnboarding();

  return (
    <TilopayPayment
      userId={user.id}
      email={user.email}
      firstName="John"
      lastName="Doe"
      amount={299}
      planName="silver"
      currency="USD"
      onSuccess={(payment) => {
        console.log('Payment successful:', payment);
        // Redirect to success page
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Show error message
      }}
      onCancel={() => {
        // Handle cancellation
      }}
    />
  );
}
```

### Using Context Methods

```jsx
import { useOnboarding } from '../context/OnboardingContext';

function CheckoutPage() {
  const { initiateTilopayPayment, verifyPayment } = useOnboarding();

  const handlePayment = async () => {
    try {
      // Initiate payment
      const response = await initiateTilopayPayment({
        amount: 299,
        planName: 'silver',
        currency: 'USD'
      });

      console.log('Payment initiated:', response);

      // The TilopayPayment component will handle the rest
      // Or you can use the tilopayConfig to initialize manually

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const checkPaymentStatus = async (paymentId) => {
    try {
      const status = await verifyPayment(paymentId);
      console.log('Payment status:', status);
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
}
```

## Step 5: Testing

### Test in Development Mode

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the payment page in your application

3. Use Tilopay test cards:
   - **Approved**: 4111 1111 1111 1111
   - **Declined**: 4000 0000 0000 0002
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date (MM/YY)

### Test Webhook Locally

Use ngrok or similar tool to expose your local server:

```bash
ngrok http 3000
```

Update your Tilopay dashboard webhook URL to:
```
https://your-ngrok-url.ngrok.io/api/tilopay/callback
```

## Step 6: Production Deployment

1. Update environment variables in your hosting platform (Vercel, Netlify, etc.)

2. Set production webhook URL in Tilopay dashboard:
```
https://yourdomain.com/api/tilopay/callback
```

3. Test thoroughly with real payment credentials

4. Monitor payment transactions in Supabase dashboard

## Pricing Plans

Default plans configured in the application:

| Plan | Amount | Features |
|------|--------|----------|
| Silver | $299 | Basic visa assistance |
| Gold | $699 | Priority processing |
| Diamond | $1,599 | Premium service |
| Diamond+ | Custom | Enterprise solution |

## Payment Flow

```
1. User selects plan on onboarding page
   ↓
2. Click "Proceed to Payment"
   ↓
3. API calls /api/tilopay/initiate
   ↓
4. Tilopay SDK loads with payment form
   ↓
5. User enters card details
   ↓
6. Click "Pay Now"
   ↓
7. Tilopay processes payment
   ↓
8. Redirect to /api/tilopay/callback
   ↓
9. Update database (onboarding_data, payments)
   ↓
10. Redirect user to success page
```

## Security Considerations

1. **API Keys**: Never commit API keys to git. Always use environment variables.

2. **RLS Policies**: The payments table has Row-Level Security enabled. Users can only view their own payments.

3. **Webhook Verification**: The callback endpoint validates Tilopay signatures (implement if provided by Tilopay).

4. **HTTPS**: Always use HTTPS in production for secure data transmission.

5. **PCI Compliance**: Tilopay handles card data - never store card numbers in your database.

## Troubleshooting

### Payment Not Completing

1. Check browser console for JavaScript errors
2. Verify API credentials in `.env.local`
3. Check Network tab for failed API requests
4. Review server logs for errors

### Webhook Not Receiving Callbacks

1. Verify webhook URL in Tilopay dashboard
2. Check that URL is publicly accessible
3. Test with curl:
```bash
curl -X POST https://yourdomain.com/api/tilopay/callback \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","orderNumber":"test-123"}'
```

### Database Errors

1. Verify migration was applied successfully
2. Check RLS policies in Supabase dashboard
3. Verify user has valid session token
4. Check server logs for detailed error messages

## Support

For issues related to:
- **Tilopay API**: Contact Tilopay support
- **Application Integration**: Check application logs and documentation
- **Database Issues**: Review Supabase dashboard and logs

## API Reference

### OnboardingContext Methods

```typescript
// Initiate Tilopay payment
initiateTilopayPayment({
  amount: number,
  planName: string,
  currency?: string
}): Promise<{
  success: boolean,
  paymentId: string,
  orderNumber: string,
  tilopayConfig: object
}>

// Verify payment status
verifyPayment(paymentId: string): Promise<{
  success: boolean,
  status: string,
  amount: number,
  transactionId: string
}>

// Mark payment as complete (auto-called by callback)
completePayment(paymentDetails: {
  plan: string,
  amount: number,
  currency: string,
  transactionId: string
}): Promise<void>
```

## Database Schema

### payments table

```sql
Column              Type        Description
-----------------  ----------  ----------------------------------
id                 UUID        Primary key
user_id            UUID        References profiles(id)
amount             DECIMAL     Payment amount
plan               TEXT        Plan name (silver, gold, etc.)
payment_method     TEXT        Default: 'tilopay'
status             TEXT        pending|completed|failed|abandoned
order_number       TEXT        Unique order reference
transaction_id     TEXT        Tilopay transaction ID
tilopay_reference  TEXT        Tilopay reference number
gateway_response   JSONB       Full gateway response
created_at         TIMESTAMPTZ Creation timestamp
updated_at         TIMESTAMPTZ Last update timestamp
```

## Additional Resources

- [Tilopay SDK Documentation](https://app.tilopay.com/sdk/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
