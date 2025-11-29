# Tilopay Quick Start Guide

## ✅ What's Been Completed

Your Tilopay payment integration is ready to use! Here's what has been set up:

### 1. Files Created

✅ **API Endpoints**
- [pages/api/tilopay/initiate.js](pages/api/tilopay/initiate.js) - Initiate payment
- [pages/api/tilopay/callback.js](pages/api/tilopay/callback.js) - Handle payment callbacks
- [pages/api/tilopay/verify.js](pages/api/tilopay/verify.js) - Verify payment status

✅ **React Components**
- [components/TilopayPayment.js](components/TilopayPayment.js) - Payment form component

✅ **Database Migration**
- [supabase/migrations/20250126_create_payments_table.sql](supabase/migrations/20250126_create_payments_table.sql) - Payments table

✅ **Context Integration**
- [context/OnboardingContext.js](context/OnboardingContext.js) - Added `initiateTilopayPayment()` and `verifyPayment()` methods

✅ **Configuration**
- `.env.local` - Tilopay credentials added
- `.env.example` - Template updated

✅ **Documentation**
- [TILOPAY_SETUP.md](TILOPAY_SETUP.md) - Complete setup guide
- [examples/payment-integration-example.js](examples/payment-integration-example.js) - Usage examples

---

## 🚀 Next Steps (Implementation)

### Step 1: Apply Database Migration

Since you already have a `payments` table, just run this migration to add Tilopay-specific columns:

```bash
# Option 1: Using Supabase CLI
npx supabase db push

# Option 2: Manually in Supabase Dashboard
# Go to SQL Editor and run the file:
# supabase/migrations/20250126_update_payments_for_tilopay.sql
```

This migration adds:
- `tilopay_reference` column
- `plan` column
- `order_number` column
- Updates constraints to include 'abandoned' status
- Adds necessary indexes

### Step 2: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

This ensures the new environment variables are loaded.

### Step 3: Test the Integration

Navigate to your onboarding page and test the payment flow:

```
http://localhost:3000/onboarding-new?step=4
```

### Step 4: Integrate into Your Onboarding Flow

Choose one of these options:

#### Option A: Use the Pre-built Component (Recommended)

Add to your `pages/onboarding-new.js` at Step 4:

```jsx
import TilopayPayment from '../components/TilopayPayment';

// In your Step 4 rendering
{currentStep === 4 && (
  <TilopayPayment
    userId={user.id}
    email={onboardingData.personalDetails?.email || user.email}
    firstName={onboardingData.personalDetails?.fullName?.split(' ')[0] || 'Customer'}
    lastName={onboardingData.personalDetails?.fullName?.split(' ').slice(1).join(' ') || ''}
    amount={selectedPlanAmount}
    planName={selectedPlan}
    currency="USD"
    onSuccess={async (payment) => {
      await markStepCompleted(4);
      await setCurrentStep(5);
    }}
    onError={(error) => {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error.message}`);
    }}
  />
)}
```

#### Option B: Use Context Methods

```jsx
import { useOnboarding } from '../context/OnboardingContext';

function PaymentStep() {
  const { initiateTilopayPayment } = useOnboarding();

  const handlePayment = async () => {
    try {
      const response = await initiateTilopayPayment({
        amount: 299,
        planName: 'silver',
        currency: 'USD'
      });
      console.log('Payment initiated:', response);
      // Use response.tilopayConfig with Tilopay SDK
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handlePayment}>Pay Now</button>;
}
```

---

## 🧪 Testing

### Test Cards (Tilopay Sandbox)

Use these test card numbers:

- **Approved Transaction**
  - Card: `4111 1111 1111 1111`
  - CVV: `123`
  - Expiry: `12/25`

- **Declined Transaction**
  - Card: `4000 0000 0000 0002`
  - CVV: `123`
  - Expiry: `12/25`

### Test Flow

1. Go to onboarding page
2. Fill in personal details
3. Navigate to payment step
4. Enter test card details
5. Click "Pay Now"
6. Verify payment completion
7. Check database for payment record

---

## 📊 Monitoring Payments

### Via Supabase Dashboard

1. Go to: https://kojoegkrhrgvzqztkjwj.supabase.co
2. Navigate to **Table Editor** → **payments**
3. View all payment transactions

### Via API

```javascript
// Verify payment status
const response = await fetch('/api/tilopay/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId: 'payment-uuid',
    userId: user.id
  })
});

const data = await response.json();
console.log('Payment status:', data);
```

---

## 🔧 Configuration Reference

### Environment Variables (Already Set)

```bash
TILOPAY_API_KEY=8176-1004-6878-8064-5787
TILOPAY_API_USER=zsQhfD
TILOPAY_API_PASSWORD=tTyKbC
```

### Payment Plans

| Plan | Amount | Description |
|------|--------|-------------|
| silver | $299 | Basic visa assistance package |
| gold | $699 | Priority processing package |
| diamond | $1,599 | Premium comprehensive package |

---

## 🎯 Integration Checklist

- [x] API endpoints created
- [x] Payment component built
- [x] Database migration prepared
- [x] Context methods added
- [x] Environment variables configured
- [ ] Database migration applied (👈 DO THIS)
- [ ] Development server restarted (👈 DO THIS)
- [ ] Payment component integrated into onboarding (👈 DO THIS)
- [ ] Test payment with sandbox card (👈 DO THIS)
- [ ] Verify payment in database (👈 DO THIS)

---

## 🆘 Troubleshooting

### Error: "Payment system not configured"

**Solution:** Restart your dev server after adding environment variables

```bash
npm run dev
```

### Error: "relation 'payments' does not exist"

**Solution:** Run the database migration in Supabase SQL Editor

### Payment form not loading

**Solution:** Check browser console for errors. Verify Tilopay SDK is loading:

```javascript
console.log('Tilopay SDK loaded:', typeof window.Tilopay !== 'undefined');
```

### Webhook not receiving callbacks

**Solution:** Update Tilopay dashboard with your callback URL:

```
Development: http://localhost:3000/api/tilopay/callback
Production: https://www.falconglobalconsulting.com/api/tilopay/callback
```

---

## 📞 Support

For questions or issues:

1. Check [TILOPAY_SETUP.md](TILOPAY_SETUP.md) for detailed documentation
2. Review [examples/payment-integration-example.js](examples/payment-integration-example.js) for code samples
3. Check browser console and server logs for error messages

---

## 🎉 You're All Set!

Your Tilopay integration is ready to go. Just:

1. ✅ Apply the database migration
2. ✅ Restart your dev server
3. ✅ Add the component to your onboarding page
4. ✅ Test with a sandbox card

Happy coding! 🚀
