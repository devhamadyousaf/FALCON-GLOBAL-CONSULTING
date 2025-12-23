# Bulk Pricing Update Feature - Guide

## 🎯 Overview

The Bulk Pricing Update feature allows administrators to update the custom pricing for **all leads** who have a specific plan in one action. This is useful for market-wide price adjustments, seasonal promotions, or plan restructuring.

## 📊 Your Plan Structure

Your pricing plans:
- **Silver**: $299
- **Gold**: $699
- **Diamond**: $1,600
- **Diamond Plus**: $1

## ✨ Features

### Individual Pricing (Per Lead)
- Set custom pricing for a specific lead
- Access via: User Detail Page → Custom Pricing Tab

### Bulk Pricing (All Leads)
- Update pricing for ALL leads with a specific plan
- Access via: Admin Dashboard → Bulk Pricing Button

## 🚀 How to Use Bulk Pricing Update

### Access the Feature

1. Login as **admin**
2. Go to **Admin Dashboard**
3. Look for **Quick Actions** section
4. Click the **"Bulk Pricing"** button (green/emerald color)

### Update Pricing for All Leads

1. **Select Plan**: Choose the plan to update (Silver, Gold, Diamond, or Diamond Plus)
2. **Enter New Price**: Input the new price per page
3. **Select Currency**: Choose currency (USD, EUR, GBP, or CRC)
4. **Add Notes** (Optional): Document why the update was made
5. **Click "Update All Users with This Plan"**
6. **Confirm**: You'll be asked to confirm the bulk update
7. **Done**: All leads with custom pricing for that plan are updated!

## 📋 Example Use Cases

### Use Case 1: Market-Wide Price Adjustment
**Scenario**: Increase all Gold plan pricing from $699 to $799

**Steps**:
1. Go to Bulk Pricing page
2. Select "Gold Plan"
3. Enter new price: `799`
4. Notes: "Market adjustment Q1 2025"
5. Click Update

**Result**: ALL users now have custom Gold pricing set to $799 (existing ones updated, new ones created)

---

### Use Case 2: Seasonal Promotion
**Scenario**: Temporary discount on Silver plan from $299 to $249

**Steps**:
1. Go to Bulk Pricing page
2. Select "Silver Plan"
3. Enter new price: `249`
4. Notes: "Summer promotion 2025"
5. Click Update

**Result**: ALL users now have custom Silver pricing set to $249 (promotional rate applied to everyone)

---

### Use Case 3: Plan Restructuring
**Scenario**: Standardize Diamond Plus pricing to $999 instead of $1

**Steps**:
1. Go to Bulk Pricing page
2. Select "Diamond Plus Plan"
3. Enter new price: `999`
4. Notes: "Plan restructuring - new standard rate"
5. Click Update

**Result**: ALL users now have custom Diamond Plus pricing set to $999

## ⚠️ Important Notes

### What Gets Updated/Created
- ✅ **ALL users** (excluding admins) will receive custom pricing for the selected plan
- ✅ **Users with existing custom pricing** - their pricing is updated
- ✅ **Users without custom pricing** - new custom pricing is created for them
- ✅ **Updated/Created timestamp** is recorded
- ✅ **Audit trail** maintained (who created, when updated)

### What Does NOT Get Affected
- ❌ Admin users (excluded from bulk updates)
- ❌ Custom pricing for other plans (only the selected plan is affected)
- ❌ Default pricing structure (remains unchanged)

### Safety Features
- 🔒 **Confirmation required** before bulk update
- 🔒 **Admin-only access**
- 🔒 **Clear warning** about affecting ALL users
- 🔒 **Result summary** shows how many users were updated and created
- 🔒 **Admin users excluded** from bulk updates

## 📊 Comparison: Individual vs Bulk

| Feature | Individual Pricing | Bulk Pricing |
|---------|-------------------|--------------|
| **Access** | User Detail Page → Custom Pricing Tab | Admin Dashboard → Bulk Pricing Button |
| **Affects** | Single lead | ALL leads (excluding admins) |
| **Use Case** | VIP pricing, special deals | Market adjustments, promotions |
| **Speed** | One at a time | All at once |
| **Confirmation** | Simple save | Double confirmation |
| **Creates New** | No (only for selected user) | Yes (for users without custom pricing) |

## 🎯 Workflow Diagrams

### Individual Pricing Workflow
```
Admin Dashboard
    ↓
Select Specific User
    ↓
Custom Pricing Tab
    ↓
Add/Edit Pricing for That User
    ↓
Save
    ↓
Only that user's pricing is updated
```

### Bulk Pricing Workflow
```
Admin Dashboard
    ↓
Click "Bulk Pricing" Button
    ↓
Select Plan (e.g., Gold)
    ↓
Enter New Price
    ↓
Confirm Bulk Update
    ↓
ALL users now have custom Gold pricing
(existing updated, new ones created)
```

## 💡 Best Practices

### When to Use Individual Pricing
- ✅ VIP clients with special agreements
- ✅ One-time promotional pricing
- ✅ Client-specific discounts
- ✅ Testing new pricing models
- ✅ Contract-based custom rates

### When to Use Bulk Pricing
- ✅ Market-wide price increases/decreases
- ✅ Seasonal promotions for all clients
- ✅ Plan restructuring
- ✅ Currency adjustments
- ✅ Standardizing pricing across ALL clients
- ✅ Setting up initial custom pricing for all users

## 🔍 Verification

After bulk update, you can verify by:

1. **Check result message**: Shows number of users updated and created
2. **Review individual users**: Open any user's Custom Pricing tab
3. **Check created_at/updated_at timestamps**: Confirms when pricing was set
4. **Review notes field**: See reason for update
5. **Verify count**: Total affected should match your total user count (minus admins)

## 🛡️ Security & Permissions

### Access Control
- Only users with `role='admin'` can access
- Bearer token authentication required
- Service role key used for database operations

### Audit Trail
- `updated_at` timestamp updated automatically
- `created_by` remains unchanged (shows who originally set it)
- Notes field can document reason for bulk update

## 📈 Monitoring

### Before Bulk Update
```sql
-- Check how many users exist (excluding admins)
SELECT COUNT(*)
FROM profiles
WHERE role != 'admin';

-- Check how many already have custom pricing for the plan
SELECT COUNT(*)
FROM custom_pricing
WHERE plan_name = 'gold';
```

### After Bulk Update
```sql
-- Verify all were updated to new price
SELECT user_id, price_per_page, updated_at
FROM custom_pricing
WHERE plan_name = 'gold'
ORDER BY updated_at DESC;
```

## ⚡ Quick Reference

### API Endpoint
```
POST /api/admin/custom-pricing/bulk-update
```

### Request Body
```json
{
  "planName": "gold",
  "newPrice": 799,
  "currency": "USD",
  "notes": "Market adjustment Q1 2025"
}
```

### Response
```json
{
  "success": true,
  "message": "Successfully updated/created pricing for 50 user(s) with gold plan (15 updated, 35 created)",
  "updatedCount": 15,
  "createdCount": 35,
  "totalAffected": 50
}
```

## 🎓 Training Checklist

For new admins, ensure they understand:

- [ ] Difference between individual and bulk pricing
- [ ] How to access bulk pricing page
- [ ] What happens when bulk update is performed
- [ ] ALL users (excluding admins) are affected
- [ ] How to verify updates were successful
- [ ] Difference between updated and created counts
- [ ] Importance of adding notes for documentation
- [ ] Cannot undo bulk updates (must update again to revert)

## ❓ FAQs

### Q: Can I undo a bulk update?
**A**: No automatic undo. You would need to perform another bulk update with the previous price, or update individual users.

### Q: What if I only want to update some users with a plan?
**A**: Use individual pricing instead. Bulk update affects ALL users (excluding admins), creating custom pricing for everyone.

### Q: Does this affect the default pricing?
**A**: No. Default pricing (Silver: $299, Gold: $699, etc.) remains unchanged. This only updates custom pricing.

### Q: Can I see who was updated/created?
**A**: Yes. The response shows counts for both updated and created records. You can query the database to see all records with their `created_at` and `updated_at` timestamps.

### Q: What happens to users without custom pricing?
**A**: NEW - They now GET custom pricing! The bulk update creates custom pricing records for all users who don't have it yet.

### Q: Can I update multiple plans at once?
**A**: No. Each bulk update affects one plan at a time. To update multiple plans, perform separate bulk updates for each.

## 🚨 Troubleshooting

### Issue: "No users found to update"
**Solution**: No users exist in the system (all are admins). Check your profiles table.

### Issue: Bulk update doesn't work
**Solution**:
1. Check you're logged in as admin
2. Verify SUPABASE_SERVICE_ROLE_KEY is set
3. Check browser console for errors
4. Verify network request completes

### Issue: Some users weren't updated/created
**Solution**: Check if they are admin users - admins are excluded from bulk updates. All other users should be affected.

## 📞 Support

For issues:
1. Check the main `CUSTOM_PRICING_README.md`
2. Review Supabase logs
3. Check browser console errors
4. Verify all environment variables are set

---

**Ready to use!** This feature streamlines pricing management across your entire lead base. 🎉
