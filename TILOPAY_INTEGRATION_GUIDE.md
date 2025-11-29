# Tilopay SDK V2 Integration - Quick Reference

## 🔴 CRITICAL: Required Elements

According to Tilopay SDK V2 documentation, you MUST have:

### 1. Required Script
```html
<script src="https://app.tilopay.com/sdk/v2/sdk_tpay.min.js"></script>
```

### 2. Required Form Structure
All payment fields MUST be inside a div with class `payFormTilopay`:

```html
<div class="payFormTilopay">
  <!-- Payment method select -->
  <select id="tlpy_payment_method"></select>
  
  <!-- Card payment div -->
  <div id="tlpy_card_payment_div">
    <select id="tlpy_saved_cards"></select>
    <input id="tlpy_cc_number" />
    <input id="tlpy_cc_expiration_date" />
    <input id="tlpy_cvv" />
  </div>
  
  <!-- Yappy/phone payment div -->
  <div id="tlpy_phone_number_div" style="display: none;">
    <input id="tlpy_phone_number" />
  </div>
</div>
```

### 3. Required Container for 3DS
**MUST** include this container for 3D Secure authentication:
```html
<div id="responseTilopay"></div>
```

## ✅ Testing Your Integration

### Step 1: Verify Dev Server is Running
```powershell
npm run dev
```

### Step 2: Test Minimal Page
Open: `http://localhost:3000/test-tilopay-minimal.html`

### Step 3: Check Browser Console
You should see:
```
🔄 DOM Loaded, checking Tilopay SDK...
✅ Tilopay Init Response: {methods: Array(X), ...}
📋 Loading payment methods: [...]
  ➕ Added method: Visa (1:1)
  ➕ Added method: Mastercard (1:2)
```

### Step 4: Verify Payment Methods Load
- Payment Method dropdown should have options (Visa, Mastercard, etc.)
- If empty, see troubleshooting below

## 🔍 Troubleshooting: No Payment Methods

### Check 1: API Key Valid?
**Open browser console and check:**
```javascript
initResponse
```

**If you see:**
```javascript
{ methods: [], cards: [] }
```
**→ Your API key may not have payment methods enabled**

### Check 2: SDK Loaded?
```javascript
typeof Tilopay  // Should return: "object"
```

**If returns "undefined":**
- Check Network tab for failed script load
- Disable ad blockers
- Check internet connection

### Check 3: API Key Configuration
Your Tilopay account needs:
1. ✅ API key activated
2. ✅ Payment gateway configured
3. ✅ Payment methods enabled
4. ✅ Account verified

**Contact Tilopay Support:**
- Email: soporte@tilo.co
- Provide: Your API key (first 10 characters only)

## 📋 Required Tilopay.Init() Parameters

### Mandatory Fields:
```javascript
await Tilopay.Init({
  token: 'YOUR-API-KEY',           // Required: From Tilopay dashboard
  currency: 'USD',                  // Required: ISO 4217 (USD, CRC, etc.)
  language: 'en',                   // Required: ISO 639-1 (en, es)
  amount: 299.00,                   // Required: Decimal (12.2 format)
  billToFirstName: 'John',         // Required
  billToLastName: 'Doe',           // Required
  billToEmail: 'john@example.com', // Required
  billToAddress: 'Street Address', // Required
  billToCountry: 'CR',             // Recommended: ISO 3166-1
  orderNumber: 'ORDER-' + Date.now(), // Required: UNIQUE per merchant
  capture: 1,                       // Required: 0=authorize, 1=capture
  redirect: 'https://your-site.com/callback', // Required: Callback URL
  subscription: 0,                  // Required: 0=no save, 1=save card
  hashVersion: 'V2'                 // Required: Always 'V2'
});
```

### Conditional Fields:
- `phoneYappy` - Required when using Yappy payment method
- `typeDni` - Required for SINPE Móvil (see documentation)
- `dni` - Required for SINPE Móvil

### Optional/Recommended Fields:
- `billToAddress2`, `billToCity`, `billToState`, `billToZipPostCode`, `billToTelephone`

## 🎯 SDK Functions Reference

### 1. Initialize Payment
```javascript
var initialize = await Tilopay.Init({ /* params */ });
// Returns: { methods: [], cards: [], ... }
```

### 2. Get Card Type
```javascript
var cardType = await Tilopay.getCardType();
// Returns: "VISA", "MASTERCARD", "AMEX", etc.
```

### 3. Start Payment
```javascript
var payment = await Tilopay.startPayment();
// Returns: { success: true/false, status: "approved", ... }
```

### 4. Update Options
```javascript
var update = await Tilopay.updateOptions({
  phoneYappy: '+507-1234-5678',
  // ... other updatable fields
});
```

### 5. Get SINPE Móvil Info
```javascript
var sinpe = await Tilopay.getSinpeMovil();
// Returns: { phone: "8888-8888", amount: "500.00", code: "TB095" }
```

## 🧪 Test Card Numbers

### Successful Payment:
- **Card**: `4111111111111111`
- **Expiry**: `12/25` (any future date)
- **CVV**: `123` (any 3 digits)

### Failed Payment (for testing):
- **Card**: `4000000000000002`
- **Expiry**: `12/25`
- **CVV**: `123`

## 🔄 Payment Flow

1. **Load SDK** → Script loads from Tilopay CDN
2. **Initialize** → `Tilopay.Init()` returns payment methods
3. **Load Methods** → Populate dropdown with methods/cards
4. **User Selects** → Card or alternative payment method
5. **User Fills** → Card details or phone number
6. **Submit** → `Tilopay.startPayment()` processes payment
7. **3DS** → If needed, shows in `responseTilopay` div
8. **Callback** → Final response sent to your `redirect` URL

## 📁 Test Files Available

1. **`/test-tilopay-minimal.html`** (✅ Recommended)
   - Simplest implementation
   - Follows official documentation exactly
   - Best for debugging

2. **`/test-tilopay.html`**
   - Enhanced with more UI feedback
   - Additional debug features

3. **`/payment?plan=silver`**
   - Full Next.js integration
   - Production-ready implementation

## ⚠️ Common Mistakes

### ❌ Wrong:
```html
<!-- Missing payFormTilopay class -->
<div>
  <select id="tlpy_payment_method"></select>
</div>
```

### ✅ Correct:
```html
<!-- Has payFormTilopay class -->
<div class="payFormTilopay">
  <select id="tlpy_payment_method"></select>
  <!-- ... other fields ... -->
</div>
<!-- Separate 3DS container -->
<div id="responseTilopay"></div>
```

## 📞 Support

**If payment methods still don't load after all checks:**

1. **Check Tilopay Account Status**
   - Login to Tilopay dashboard
   - Verify API key is active
   - Check payment methods are enabled

2. **Test with Minimal HTML**
   - Use `/test-tilopay-minimal.html`
   - Check browser console
   - Click "Debug Info" button

3. **Contact Tilopay**
   - Email: soporte@tilo.co
   - Documentation: https://tilopay.com/documentacion/sdk
   - Provide: API key (partial), console errors, screenshots

## 🚀 Next Steps

1. ✅ Start dev server: `npm run dev`
2. ✅ Open: `http://localhost:3000/test-tilopay-minimal.html`
3. ✅ Check console for initialization
4. ✅ Verify payment methods appear
5. ✅ Test with test card
6. ✅ Then test: `http://localhost:3000/payment?plan=silver`

**All required elements are now in place!** 🎉
