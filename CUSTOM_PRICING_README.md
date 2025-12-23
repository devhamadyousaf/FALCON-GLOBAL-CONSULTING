# Custom Pricing Feature Documentation

## Overview
This feature allows administrators to set custom pricing per lead (user) for different plans. Each lead can have their own specific pricing that overrides the default pricing structure.

## Features
- ✅ Set custom price per page for specific leads
- ✅ Support for multiple plans (Silver, Gold, Diamond, Diamond Plus)
- ✅ Multiple currency support (USD, EUR, GBP, CRC)
- ✅ Add notes to pricing entries
- ✅ Edit and delete custom pricing
- ✅ View default pricing reference
- ✅ Track who created/updated pricing and when

## Database Schema

### Custom Pricing Table
```sql
custom_pricing (
  id: uuid (primary key)
  user_id: uuid (foreign key to profiles)
  plan_name: text (e.g., 'silver', 'gold', 'diamond', 'diamond-plus')
  price_per_page: numeric(10, 2)
  currency: text (default: 'USD')
  notes: text (optional)
  created_by: uuid (admin who created)
  created_at: timestamp
  updated_at: timestamp
)
```

## Installation & Setup

### 1. Run Database Migration
Execute the SQL migration file to create the necessary table and policies:

```bash
# Navigate to your project directory
cd e:\FALCON-GLOBAL-CONSULTING

# Apply the migration to your Supabase database
# You can do this via Supabase Dashboard > SQL Editor
# Or use the Supabase CLI:
supabase db push
```

Alternatively, copy the contents of `supabase/migrations/20250124_add_custom_pricing.sql` and run it in your Supabase SQL Editor.

### 2. Verify Installation
Check that the table was created successfully:

```sql
SELECT * FROM custom_pricing LIMIT 1;
```

### 3. Set Environment Variables
Ensure you have the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Usage Guide

### For Administrators

#### 1. Access Custom Pricing
1. Login as an admin
2. Navigate to Admin Dashboard
3. Click on any user to view their details
4. Click on the "Custom Pricing" tab

#### 2. Add Custom Pricing
1. Click the "Add Custom Pricing" button
2. Select a plan from the dropdown (Silver, Gold, Diamond, or Diamond Plus)
3. Enter the custom price per page
4. Select the currency (USD, EUR, GBP, or CRC)
5. Optionally add notes (e.g., "Special discount for bulk order")
6. Click "Save Pricing"

#### 3. Edit Custom Pricing
1. In the Custom Pricing tab, find the pricing you want to edit
2. Click the blue edit icon (pencil)
3. Modify the price, currency, or notes
4. Click "Save Pricing"

**Note:** Plan name cannot be changed. To change the plan, delete the existing pricing and create a new one.

#### 4. Delete Custom Pricing
1. In the Custom Pricing tab, find the pricing you want to delete
2. Click the red delete icon (trash)
3. Confirm the deletion

#### 5. View Default Pricing
The default pricing reference is shown at the bottom of the Custom Pricing tab:
- Silver: $299/page
- Gold: $699/page
- Diamond: $1,600/page
- Diamond Plus: $1/page

## API Endpoints

### GET `/api/admin/custom-pricing?userId={userId}`
Fetch all custom pricing for a specific user.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "plan_name": "gold",
      "price_per_page": 559,
      "currency": "USD",
      "notes": "VIP discount - 20% off",
      "created_at": "2025-01-24T...",
      "updated_at": "2025-01-24T...",
      "created_by_profile": {
        "full_name": "Admin Name",
        "email": "admin@example.com"
      }
    }
  ]
}
```

### POST `/api/admin/custom-pricing`
Create or update custom pricing.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "uuid",
  "planName": "diamond",
  "pricePerPage": 1200,
  "currency": "USD",
  "notes": "Partner program - special pricing"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* pricing object */ },
  "message": "Custom pricing created successfully"
}
```

### DELETE `/api/admin/custom-pricing?pricingId={pricingId}`
Delete a custom pricing entry.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Custom pricing deleted successfully"
}
```

## Helper Functions

### `getCustomPricing(userId, token)`
Fetch custom pricing for a user.

```javascript
import { getCustomPricing } from '../lib/custom-pricing';

const result = await getCustomPricing(userId, token);
if (result.success) {
  console.log(result.data);
}
```

### `saveCustomPricing({ userId, planName, pricePerPage, currency, notes, token })`
Create or update custom pricing.

```javascript
import { saveCustomPricing } from '../lib/custom-pricing';

const result = await saveCustomPricing({
  userId: 'user-uuid',
  planName: 'gold',
  pricePerPage: 559,
  currency: 'USD',
  notes: 'VIP client - 20% discount',
  token: authToken
});
```

### `deleteCustomPricing(pricingId, token)`
Delete custom pricing.

```javascript
import { deleteCustomPricing } from '../lib/custom-pricing';

const result = await deleteCustomPricing(pricingId, token);
```

### `getEffectivePrice(userId, planName, defaultPrices, token)`
Get the effective price for a user, falling back to default if no custom pricing exists.

```javascript
import { getEffectivePrice, DEFAULT_PRICING } from '../lib/custom-pricing';

const effectivePrice = await getEffectivePrice(
  userId,
  'gold',
  DEFAULT_PRICING,
  token
);

console.log(effectivePrice.pricePerPage); // 559 (custom) or 699 (default)
console.log(effectivePrice.isCustom); // true or false
```

## Security & Permissions

### Row Level Security (RLS)
The custom_pricing table has RLS enabled with the following policies:

1. **Admins can view all custom pricing**
   - Only users with role='admin' can SELECT

2. **Admins can insert custom pricing**
   - Only users with role='admin' can INSERT

3. **Admins can update custom pricing**
   - Only users with role='admin' can UPDATE

4. **Admins can delete custom pricing**
   - Only users with role='admin' can DELETE

5. **Users can view their own custom pricing**
   - Users can SELECT their own pricing (user_id = auth.uid())

### API Security
- All API endpoints verify admin authentication
- Service role key is used for database operations
- User tokens are validated before processing requests

## Customization

### Adding New Plans
To add new plans, update the `AVAILABLE_PLANS` array in `lib/custom-pricing.js`:

```javascript
export const AVAILABLE_PLANS = [
  { name: 'silver', label: 'Silver Plan', defaultPrice: 299 },
  { name: 'gold', label: 'Gold Plan', defaultPrice: 699 },
  { name: 'diamond', label: 'Diamond Plan', defaultPrice: 1600 },
  { name: 'diamond-plus', label: 'Diamond Plus Plan', defaultPrice: 1 },
  // Add your new plan here
  { name: 'custom', label: 'Custom Plan', defaultPrice: 30 }
];
```

### Adding New Currencies
Update the currency dropdown in the pricing modal:

```javascript
<select value={pricingForm.currency} ...>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
  <option value="GBP">GBP</option>
  <option value="CRC">CRC</option>
  {/* Add your new currency */}
  <option value="CAD">CAD</option>
</select>
```

### Changing Default Prices
Update the `DEFAULT_PRICING` object in `lib/custom-pricing.js`:

```javascript
export const DEFAULT_PRICING = {
  silver: 299,
  gold: 699,
  diamond: 1600,
  'diamond-plus': 1
};
```

## Integration with Payment Flow

To integrate custom pricing with your payment flow:

```javascript
import { getEffectivePrice, DEFAULT_PRICING } from '../lib/custom-pricing';

// In your payment/checkout component
const calculateTotal = async (userId, planName, numberOfPages) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const pricing = await getEffectivePrice(
    userId,
    planName,
    DEFAULT_PRICING,
    token
  );

  if (pricing.success) {
    const total = pricing.pricePerPage * numberOfPages;
    return {
      pricePerPage: pricing.pricePerPage,
      currency: pricing.currency,
      total,
      isCustomPricing: pricing.isCustom
    };
  }

  // Fallback to default
  const defaultPrice = DEFAULT_PRICING[planName] || 0;
  return {
    pricePerPage: defaultPrice,
    currency: 'USD',
    total: defaultPrice * numberOfPages,
    isCustomPricing: false
  };
};
```

## Troubleshooting

### Custom pricing not showing
1. Verify the migration was run successfully
2. Check browser console for errors
3. Verify admin permissions in profiles table
4. Check Supabase RLS policies are enabled

### Cannot save custom pricing
1. Verify SUPABASE_SERVICE_ROLE_KEY is set in environment variables
2. Check authentication token is valid
3. Verify user has admin role
4. Check for duplicate plan_name for the same user

### API returns 401 Unauthorized
1. Verify user is logged in
2. Check admin role in profiles table
3. Verify token is being sent in Authorization header

## Files Created/Modified

### New Files
- `supabase/migrations/20250124_add_custom_pricing.sql` - Database migration
- `pages/api/admin/custom-pricing.js` - API endpoints
- `lib/custom-pricing.js` - Helper functions

### Modified Files
- `pages/dashboard/admin/user/[userId].js` - Added Custom Pricing tab and UI

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase logs in your dashboard
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

## Future Enhancements

Potential improvements:
- Bulk pricing updates for multiple users
- Pricing history/audit log
- Discount percentage instead of fixed price
- Time-limited custom pricing
- Integration with subscription plans
- Export pricing data to CSV
- Pricing templates for common scenarios
