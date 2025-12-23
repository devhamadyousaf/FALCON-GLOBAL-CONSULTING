# Quick Start Guide - Custom Pricing Feature

## 🚀 Quick Implementation (5 Minutes)

### Step 1: Run the Migration (2 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250124_add_custom_pricing.sql`
4. Paste and click **RUN**
5. You should see: ✅ Success. No rows returned

### Step 2: Verify Environment Variables (1 minute)

Check your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Restart Your Dev Server (1 minute)

```bash
# Stop your current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Feature (1 minute)

1. Login as an **admin** user
2. Go to **Admin Dashboard**
3. Click on any **user**
4. Click the **"Custom Pricing"** tab
5. Click **"Add Custom Pricing"** button
6. Fill in the form and save!

## 🎯 Your First Custom Pricing

### Example: Set Custom Pricing for a VIP Client

1. Navigate to: `Dashboard > Admin > Users > [Select User] > Custom Pricing Tab`

2. Click **"Add Custom Pricing"**

3. Fill in:
   - **Plan Name**: Gold
   - **Price Per Page**: `559` (instead of default $699)
   - **Currency**: USD
   - **Notes**: "VIP client - 20% discount"

4. Click **"Save Pricing"**

5. Done! ✅ This user now has custom pricing for the Gold plan

## 📊 What You Built

### Files Created:
```
supabase/migrations/20250124_add_custom_pricing.sql
pages/api/admin/custom-pricing.js
pages/api/admin/custom-pricing/bulk-update.js (NEW - Bulk Update)
pages/dashboard/admin/bulk-pricing.js (NEW - Bulk Pricing Page)
lib/custom-pricing.js
```

### Files Modified:
```
pages/dashboard/admin/user/[userId].js (Custom Pricing Tab)
pages/dashboard/admin.js (Added Bulk Pricing Button)
```

### Database Table Created:
```
custom_pricing
├── id (uuid)
├── user_id (uuid) → references profiles
├── plan_name (text)
├── price_per_page (numeric)
├── currency (text)
├── notes (text)
├── created_by (uuid) → references profiles
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Your Pricing Plans:
- **Silver**: $299
- **Gold**: $699
- **Diamond**: $1,600
- **Diamond Plus**: $1

## 🔧 Common Use Cases

### Use Case 1: VIP Client Discount
**Scenario**: VIP client gets 20% off Gold plan

```javascript
// In the UI:
Plan: Gold
Price Per Page: $559 (instead of $699)
Notes: "VIP client - 20% discount"
```

### Use Case 2: Partner Pricing
**Scenario**: Strategic partner gets special rates on Diamond plan

```javascript
Plan: Diamond
Price Per Page: $1200 (instead of $1600)
Currency: USD
Notes: "Partner program - special pricing"
```

### Use Case 3: Bulk Update - Market Adjustment
**Scenario**: Increase all Gold plan custom pricing from $699 to $799

```javascript
// In Bulk Pricing page:
Plan: Gold
New Price: $799
Notes: "Market adjustment Q1 2025"
→ All leads with custom Gold pricing updated at once!
```

## 🔍 How to Use in Your Payment Flow

### Before (Without Custom Pricing):
```javascript
// Fixed pricing for everyone
const pricePerPage = 699; // Gold plan
const total = pricePerPage * numberOfPages;
```

### After (With Custom Pricing):
```javascript
import { getEffectivePrice, DEFAULT_PRICING } from '../lib/custom-pricing';

// Get custom or default pricing
const pricing = await getEffectivePrice(userId, 'gold', DEFAULT_PRICING, token);

const pricePerPage = pricing.pricePerPage; // $559 if custom, $699 if default
const total = pricePerPage * numberOfPages;

// Show indicator if custom pricing is applied
if (pricing.isCustom) {
  console.log('✨ Custom pricing applied!');
}
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Migration ran successfully in Supabase
- [ ] Custom Pricing tab appears in user detail page
- [ ] Can add new custom pricing
- [ ] Can edit existing custom pricing
- [ ] Can delete custom pricing
- [ ] Default pricing reference shows at bottom
- [ ] Only admins can access the feature

## 🎨 UI Features

### Custom Pricing Tab Shows:
- ✅ List of all custom pricing for the user
- ✅ Price per page with currency
- ✅ Plan name (Silver, Gold, Diamond, Diamond Plus)
- ✅ Notes added by admin
- ✅ Created/updated timestamps
- ✅ Who created the pricing
- ✅ Edit and delete buttons
- ✅ Default pricing reference table

### Add/Edit Modal Shows:
- ✅ Plan dropdown with default prices
- ✅ Price per page input
- ✅ Currency selector (USD, EUR, GBP, CRC)
- ✅ Notes textarea
- ✅ Save and cancel buttons
- ✅ Loading states

## 🛡️ Security Features

✅ **Row Level Security (RLS)** enabled
✅ **Admin-only** access to create/edit/delete
✅ **Users can view** their own pricing
✅ **Token authentication** required
✅ **Service role key** for operations
✅ **Audit trail** (created_by, timestamps)

## 📱 API Quick Reference

### Get Custom Pricing
```javascript
GET /api/admin/custom-pricing?userId={userId}
Headers: { Authorization: Bearer {token} }
```

### Save Custom Pricing
```javascript
POST /api/admin/custom-pricing
Headers: { Authorization: Bearer {token} }
Body: { userId, planName, pricePerPage, currency, notes }
```

### Delete Custom Pricing
```javascript
DELETE /api/admin/custom-pricing?pricingId={pricingId}
Headers: { Authorization: Bearer {token} }
```

## 🐛 Quick Troubleshooting

### Issue: Tab doesn't appear
**Solution**: Hard refresh browser (Ctrl+Shift+R)

### Issue: Can't save pricing
**Solution**: Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Issue: "Unauthorized" error
**Solution**: Verify user has `role='admin'` in profiles table

### Issue: Migration fails
**Solution**: Check if `update_updated_at_column()` function exists:
```sql
-- Run this first if needed:
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## 🎓 Next Steps

1. **Test with Real Data**: Create custom pricing for a test user
2. **Integrate with Checkout**: Use `getEffectivePrice()` in your payment flow
3. **Add Notifications**: Notify users when custom pricing is applied
4. **Export Reports**: Track which users have custom pricing
5. **Set Expiration**: Add date fields for time-limited pricing

## 💡 Pro Tips

1. **Use Notes Field**: Document why custom pricing was given
2. **Track Changes**: The system logs who created/updated pricing
3. **Currency Flexibility**: Support international clients with multi-currency
4. **Default Reference**: Always show default prices for comparison
5. **Plan Names**: Use unique constraint prevents duplicate plans per user

## 🎉 Congratulations!

You now have a fully functional custom pricing system where admins can:
- Set custom pricing per lead
- Support multiple plans and currencies
- Track pricing changes
- Override default pricing easily

**Ready to use!** 🚀

---

**Need help?** Check the full documentation in `CUSTOM_PRICING_README.md`
