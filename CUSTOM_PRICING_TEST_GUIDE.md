# Custom Pricing - Testing Guide

## 🧪 Complete Testing Checklist

Use this guide to thoroughly test the custom pricing feature.

## Pre-Test Setup

### 1. Verify Database Setup
```sql
-- Run in Supabase SQL Editor to verify table exists
SELECT * FROM custom_pricing LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'custom_pricing';
```

### 2. Create Test Users
You need:
- ✅ 1 Admin user (role='admin')
- ✅ 2 Regular users (role='customer') for testing

### 3. Verify Environment
```bash
# Check .env.local has these keys:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Test Suite 1: Admin Access

### ✅ Test 1.1: Admin Can Access Custom Pricing Tab
**Steps:**
1. Login as admin
2. Go to Admin Dashboard
3. Click on any user
4. Look for "Custom Pricing" tab

**Expected Result:**
- ✅ "Custom Pricing" tab is visible
- ✅ Tab has a dollar sign icon
- ✅ Clicking tab shows custom pricing interface

**Pass/Fail:** ___________

---

### ✅ Test 1.2: Customer Cannot Access Admin Area
**Steps:**
1. Logout admin
2. Login as customer
3. Try to navigate to `/dashboard/admin`

**Expected Result:**
- ✅ Redirected to `/dashboard/customer`
- ✅ Cannot access admin features

**Pass/Fail:** ___________

---

## Test Suite 2: Create Custom Pricing

### ✅ Test 2.1: Add New Custom Pricing
**Steps:**
1. Login as admin
2. Navigate to User Detail page
3. Click "Custom Pricing" tab
4. Click "Add Custom Pricing" button
5. Select "Gold" plan
6. Enter price: `559`
7. Select currency: `USD`
8. Enter notes: "Test pricing - VIP discount"
9. Click "Save Pricing"

**Expected Result:**
- ✅ Modal opens with form
- ✅ All fields are editable
- ✅ Success message appears
- ✅ New pricing appears in the list
- ✅ Shows price as USD $559
- ✅ Shows "Custom Pricing" badge
- ✅ Shows notes: "Test pricing - VIP discount"
- ✅ Shows who created it

**Pass/Fail:** ___________

---

### ✅ Test 2.2: Form Validation
**Steps:**
1. Click "Add Custom Pricing"
2. Try to save without selecting plan
3. Select plan but leave price empty
4. Try to save

**Expected Result:**
- ✅ Save button is disabled when fields are empty
- ✅ Cannot submit incomplete form

**Pass/Fail:** ___________

---

### ✅ Test 2.3: Duplicate Plan Prevention
**Steps:**
1. Add custom pricing for "Silver" plan
2. Try to add another "Silver" plan for same user

**Expected Result:**
- ✅ Updates existing "Silver" plan instead of creating duplicate
- ✅ Shows "Custom pricing updated successfully" message

**Pass/Fail:** ___________

---

## Test Suite 3: Edit Custom Pricing

### ✅ Test 3.1: Edit Existing Pricing
**Steps:**
1. Click edit icon (pencil) on existing pricing
2. Change price from `559` to `599`
3. Update notes to "Updated VIP pricing"
4. Click "Save Pricing"

**Expected Result:**
- ✅ Modal opens with existing values pre-filled
- ✅ Plan name dropdown is disabled (cannot change)
- ✅ Can modify price, currency, and notes
- ✅ Success message appears
- ✅ Updated values show in the list
- ✅ Updated timestamp changes

**Pass/Fail:** ___________

---

### ✅ Test 3.2: Cancel Edit
**Steps:**
1. Click edit icon
2. Change some values
3. Click "Cancel"

**Expected Result:**
- ✅ Modal closes
- ✅ No changes are saved
- ✅ Original values remain

**Pass/Fail:** ___________

---

## Test Suite 4: Delete Custom Pricing

### ✅ Test 4.1: Delete Pricing
**Steps:**
1. Click delete icon (trash) on pricing
2. Confirm deletion

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Pricing is removed from list
- ✅ Success message appears

**Pass/Fail:** ___________

---

### ✅ Test 4.2: Cancel Delete
**Steps:**
1. Click delete icon
2. Cancel confirmation

**Expected Result:**
- ✅ Pricing is NOT deleted
- ✅ Remains in the list

**Pass/Fail:** ___________

---

## Test Suite 5: Multiple Plans

### ✅ Test 5.1: Add Multiple Plans for Same User
**Steps:**
1. Add "Silver" plan: $250
2. Add "Gold" plan: $559
3. Add "Diamond" plan: $1200
4. Add "Diamond Plus" plan: $0.99

**Expected Result:**
- ✅ All 4 plans are created
- ✅ Each shows correct price
- ✅ All appear in the list
- ✅ No duplicates

**Pass/Fail:** ___________

---

## Test Suite 6: Different Currencies

### ✅ Test 6.1: Test Multiple Currencies
**Steps:**
1. Create pricing with USD
2. Create pricing with EUR
3. Create pricing with GBP
4. Create pricing with CRC

**Expected Result:**
- ✅ All currencies save correctly
- ✅ Currency symbol displays correctly
- ✅ Formatting is correct

**Pass/Fail:** ___________

---

## Test Suite 7: API Testing

### ✅ Test 7.1: GET Custom Pricing API
**Steps:**
```javascript
// In browser console (while logged in as admin):
const response = await fetch('/api/admin/custom-pricing?userId=USER_ID_HERE', {
  headers: {
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`
  }
});
const data = await response.json();
console.log(data);
```

**Expected Result:**
- ✅ Returns 200 status
- ✅ Returns array of pricing
- ✅ Each pricing has all fields

**Pass/Fail:** ___________

---

### ✅ Test 7.2: POST Custom Pricing API
**Steps:**
```javascript
const response = await fetch('/api/admin/custom-pricing', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'USER_ID_HERE',
    planName: 'gold',
    pricePerPage: 559,
    currency: 'USD',
    notes: 'API test - VIP pricing'
  })
});
const data = await response.json();
console.log(data);
```

**Expected Result:**
- ✅ Returns 200 status
- ✅ Returns created pricing object
- ✅ Success message in response

**Pass/Fail:** ___________

---

## Test Suite 8: UI/UX Tests

### ✅ Test 8.1: Empty State
**Steps:**
1. View pricing tab for user with no custom pricing

**Expected Result:**
- ✅ Shows empty state message
- ✅ Shows dollar sign icon
- ✅ Message: "No Custom Pricing Set"
- ✅ Helpful text about default pricing

**Pass/Fail:** ___________

---

### ✅ Test 8.2: Loading State
**Steps:**
1. Navigate to user page
2. Observe pricing tab while loading

**Expected Result:**
- ✅ Shows loading spinner
- ✅ Message: "Loading custom pricing..."
- ✅ No errors in console

**Pass/Fail:** ___________

---

### ✅ Test 8.3: Default Pricing Reference
**Steps:**
1. View Custom Pricing tab
2. Scroll to bottom

**Expected Result:**
- ✅ Shows "Default Pricing Reference" section
- ✅ Shows all 4 default plans:
  - Silver: $299
  - Gold: $699
  - Diamond: $1,600
  - Diamond Plus: $1

**Pass/Fail:** ___________

---

## Test Suite 9: Security Tests

### ✅ Test 9.1: Non-Admin API Access
**Steps:**
1. Logout
2. Login as customer (non-admin)
3. Try to call API:
```javascript
fetch('/api/admin/custom-pricing?userId=SOME_USER_ID', {
  headers: { 'Authorization': 'Bearer YOUR_CUSTOMER_TOKEN' }
});
```

**Expected Result:**
- ✅ Returns 403 Forbidden
- ✅ Error message: "Admin access required"

**Pass/Fail:** ___________

---

### ✅ Test 9.2: RLS Policies
**Steps:**
```sql
-- In Supabase SQL Editor, logged in as customer user:
SELECT * FROM custom_pricing;
```

**Expected Result:**
- ✅ Only returns pricing for current user (if any)
- ✅ Cannot see other users' pricing

**Pass/Fail:** ___________

---

## Test Suite 10: Edge Cases

### ✅ Test 10.1: Very Large Price
**Steps:**
1. Enter price: `999999.99`
2. Save

**Expected Result:**
- ✅ Saves correctly
- ✅ Displays correctly
- ✅ No overflow issues

**Pass/Fail:** ___________

---

### ✅ Test 10.2: Decimal Precision
**Steps:**
1. Enter price: `559.555`
2. Save

**Expected Result:**
- ✅ Rounds to 2 decimal places: `559.56`
- ✅ Or accepts as-is if DB allows

**Pass/Fail:** ___________

---

### ✅ Test 10.3: Zero Price
**Steps:**
1. Enter price: `0.00`
2. Save

**Expected Result:**
- ✅ Saves successfully
- ✅ Displays as $0.00
- ✅ Could be used for free tier

**Pass/Fail:** ___________

---

### ✅ Test 10.4: Very Long Notes
**Steps:**
1. Enter notes with 500+ characters
2. Save

**Expected Result:**
- ✅ Saves successfully
- ✅ Displays correctly (may truncate in UI)

**Pass/Fail:** ___________

---

## Test Suite 11: Integration Tests

### ✅ Test 11.1: getEffectivePrice() Helper
**Steps:**
```javascript
import { getEffectivePrice, DEFAULT_PRICING } from '../lib/custom-pricing';

// Test with custom pricing
const result1 = await getEffectivePrice(
  userIdWithCustomPricing,
  'gold',
  DEFAULT_PRICING,
  token
);

// Test without custom pricing
const result2 = await getEffectivePrice(
  userIdWithoutCustomPricing,
  'gold',
  DEFAULT_PRICING,
  token
);
```

**Expected Result:**
- ✅ result1.isCustom === true
- ✅ result1.pricePerPage === custom price (e.g., 559)
- ✅ result2.isCustom === false
- ✅ result2.pricePerPage === 699 (default)

**Pass/Fail:** ___________

---

## Test Suite 12: Browser Compatibility

### ✅ Test 12.1: Test in Different Browsers
Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected Result:**
- ✅ Works in all browsers
- ✅ UI looks correct
- ✅ No console errors

**Pass/Fail:** ___________

---

## Test Suite 13: Mobile Responsiveness

### ✅ Test 13.1: Mobile View
**Steps:**
1. Open in mobile browser or use responsive mode
2. Navigate to Custom Pricing tab
3. Try to add/edit pricing

**Expected Result:**
- ✅ Tab is accessible
- ✅ Modal fits screen
- ✅ Form is usable
- ✅ Buttons are tappable
- ✅ List is scrollable

**Pass/Fail:** ___________

---

## Performance Tests

### ✅ Test 14.1: Load Time
**Steps:**
1. User with 10+ custom pricing entries
2. Load Custom Pricing tab
3. Check network tab

**Expected Result:**
- ✅ Loads in < 2 seconds
- ✅ No unnecessary requests
- ✅ Data cached appropriately

**Pass/Fail:** ___________

---

## Final Verification

After all tests, verify:

- [ ] All API endpoints work
- [ ] All UI interactions work
- [ ] Security is properly enforced
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Database constraints working
- [ ] RLS policies enforced
- [ ] Audit trail working (created_by, timestamps)
- [ ] Helper functions work correctly

---

## Test Results Summary

**Total Tests:** 35
**Passed:** ___________
**Failed:** ___________
**Success Rate:** ___________%

## Issues Found

| Test # | Issue Description | Severity | Status |
|--------|------------------|----------|--------|
|        |                  |          |        |
|        |                  |          |        |
|        |                  |          |        |

## Sign-Off

**Tested By:** ___________________
**Date:** ___________________
**Environment:** Dev / Staging / Production
**Version:** ___________________

---

## Notes

Use this space to add any additional observations or comments:

```

```

---

**After testing, if all tests pass, you're ready for production!** 🚀
