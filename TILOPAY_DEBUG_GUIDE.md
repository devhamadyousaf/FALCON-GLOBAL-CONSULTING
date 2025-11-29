# Tilopay Payment Methods Not Loading - Debug Guide

## Issue
The standalone test page shows "Please select a payment method" but no payment methods are appearing in the dropdown.

## Possible Causes

### 1. Invalid API Key
**Symptom**: SDK initialization fails silently or returns no methods
**Check**: 
```javascript
// Look in browser console for error
// Should see: ✅ Success! Found X payment method(s)
// Instead seeing: ❌ Failed or No payment methods
```

**Fix**: Verify your API key in `.env.local`:
```env
TILOPAY_API_KEY=8176-1004-6878-8064-5787
```

### 2. SDK Not Loading
**Symptom**: "Tilopay is not defined" error
**Check**: Network tab shows failed request to `app.tilopay.com`
**Fix**: 
- Check internet connection
- Disable ad blockers
- Try different browser
- Check firewall settings

### 3. CORS Issues
**Symptom**: Console shows CORS errors
**Fix**: Access via `http://localhost:3000` (not `file://`)

### 4. API Key Not Activated
**Symptom**: SDK loads but returns empty methods array
**Fix**: Contact Tilopay support to activate your API key for payment methods

## Testing Steps

### Step 1: Test Minimal Page
1. **Start dev server** (if not running):
   ```powershell
   npm run dev
   ```

2. **Open minimal test page**:
   ```
   http://localhost:3000/test-tilopay-minimal.html
   ```

3. **Check console immediately**:
   - Should see: `🔄 DOM Loaded, checking Tilopay SDK...`
   - Should see: `✅ Tilopay Init Response:`
   - Should see: `📋 Loading payment methods:`

4. **Click "Debug Info" button**
   - Check `paymentMethodsCount` - should be > 0
   - Check `sdkLoaded` - should be `true`
   - Check `initResponse.methods` - should have array of methods

### Step 2: Check API Response
**Open browser DevTools Console and run**:
```javascript
// After page loads, check the init response
console.log('Init Response:', initResponse);
console.log('Methods:', initResponse?.methods);
console.log('Methods Count:', initResponse?.methods?.length);
```

**Expected Output**:
```javascript
{
  methods: [
    { id: "1:1", name: "Visa" },
    { id: "1:2", name: "Mastercard" },
    // ... more methods
  ],
  cards: [],
  // ... other properties
}
```

**If Empty**:
```javascript
{
  methods: [],
  cards: []
}
```
**→ Your API key may not have payment methods enabled**

### Step 3: Test with Different API Key
If you have another Tilopay account or test credentials:

1. Edit `test-tilopay-minimal.html`
2. Replace the token:
   ```javascript
   const TILOPAY_TOKEN = 'YOUR-TEST-TOKEN-HERE';
   ```
3. Refresh page

### Step 4: Check Tilopay Dashboard
1. Login to Tilopay dashboard
2. Check if API key is active
3. Verify payment methods are enabled for your account
4. Check if account is in test/sandbox mode

## Common API Key Issues

### Sandbox vs Production
- **Sandbox Key**: Used for testing, may have limited methods
- **Production Key**: Real payments, full method list
- **Check**: Your key format and where you got it from

### Account Not Configured
Some Tilopay accounts need configuration before payment methods appear:
- Payment gateway setup
- Bank account verification  
- Business verification

## Quick Fix Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Accessing via `http://localhost:3000/test-tilopay-minimal.html`
- [ ] Browser console shows no errors
- [ ] SDK script loaded (check Network tab)
- [ ] API key is correct in the HTML file
- [ ] Console shows init response with methods array
- [ ] `initResponse.methods.length > 0`

## Debug Commands

**In Browser Console**:
```javascript
// Check if SDK is loaded
typeof Tilopay

// Check init response
initResponse

// Check payment methods
initResponse?.methods

// Manually test initialization
Tilopay.Init({
    token: '8176-1004-6878-8064-5787',
    currency: "USD",
    language: "en",
    amount: 1,
    billToFirstName: "Test",
    billToLastName: "User",
    billToEmail: "test@example.com",
    orderNumber: "test-" + Date.now(),
    billToAddress: "San Jose",
    billToCountry: "CR",
    capture: 1,
    redirect: "https://example.com",
    subscription: 0,
    hashVersion: "V2"
}).then(console.log).catch(console.error);
```

## Contact Tilopay Support

If none of the above works, contact Tilopay:
- **Email**: soporte@tilo.co
- **Provide**:
  - Your API key (first 10 chars only)
  - Error messages from console
  - Screenshot of browser console
  - Your account email

## Files to Test

1. **Minimal Test** (recommended first):
   - `http://localhost:3000/test-tilopay-minimal.html`
   - Simplest possible implementation
   - Easiest to debug

2. **Full Test**:
   - `http://localhost:3000/test-tilopay.html`
   - More features and error handling

3. **Actual Payment Page**:
   - `http://localhost:3000/payment?plan=silver`
   - Full application integration

## Expected Working Behavior

When everything works correctly:

1. **Page loads**
2. **Console shows**:
   ```
   🔄 DOM Loaded, checking Tilopay SDK...
   ✅ Tilopay Init Response: {methods: Array(3), cards: Array(0), ...}
   📋 Loading payment methods: [{...}, {...}, {...}]
     ➕ Added method: Visa (1:1)
     ➕ Added method: Mastercard (1:2)
     ➕ Added method: American Express (1:3)
   💳 Loading saved cards: []
     ℹ️ No saved cards
   ```

3. **Status message**: "✅ Success! Found 3 payment method(s)"

4. **Payment Method dropdown has options**:
   - Select payment method
   - Visa
   - Mastercard
   - American Express

5. **Can select a method and see card inputs**

## Next Steps After Payment Methods Load

Once payment methods appear:

1. **Select a payment method** (e.g., Visa)
2. **Enter test card**:
   - Card: `4111111111111111`
   - Expire: `12/25`
   - CVV: `123`
3. **Click "Pay $1.00"**
4. **Check console for payment response**

## Still Not Working?

If payment methods still don't load after all checks:

1. **Take screenshot** of browser console
2. **Run debug info** button and copy output
3. **Check** `.env.local` for correct credentials
4. **Try** a different browser (Chrome, Firefox, Edge)
5. **Verify** Tilopay service status
6. **Contact** Tilopay support with error details
