# 🔧 FIX: Admin Dashboard Not Showing All Users

## Problem
The admin dashboard only shows the admin user (yourself) and not other users like "Taha Sheikh".

## Root Cause
**Row Level Security (RLS)** circular reference issue:
- The policy "Admins can view all profiles" checks if the user is admin by querying the `profiles` table
- But the `profiles` table itself is protected by RLS
- This creates a chicken-and-egg problem where the query can't complete

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Run the Fix Script
Copy and paste the entire contents of `fix-admin-rls-complete.sql` into the SQL Editor and click **Run**.

Or run this shorter version:

```sql
-- Create helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN (user_role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    public.is_admin() = true OR auth.uid() = id
  );

-- Fix other tables
DROP POLICY IF EXISTS "Admins can view all onboarding data" ON public.onboarding_data;
CREATE POLICY "Admins can view all onboarding data"
  ON public.onboarding_data FOR SELECT
  USING (public.is_admin() = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all applications" ON public.job_applications;
CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (public.is_admin() = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all documents" ON public.documents;
CREATE POLICY "Admins can view all documents"
  ON public.documents FOR SELECT
  USING (public.is_admin() = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.is_admin() = true OR auth.uid() = user_id);
```

### Step 3: Verify the Fix

Run this query in SQL Editor:
```sql
SELECT email, full_name, role 
FROM public.profiles 
ORDER BY created_at;
```

**Expected Result:** You should see BOTH users:
- ✅ tahasheikh111.ts@gmail.com (Taha Sheikh - customer)
- ✅ devincicodes.official@gmail.com (DeVinci Codes - admin)

### Step 4: Refresh Your Dashboard

1. Go back to your admin dashboard: `http://localhost:3000/dashboard/admin`
2. **Hard refresh** the page (Ctrl + Shift + R or Cmd + Shift + R)
3. You should now see **both users** in the User Management section

## Expected Result

### Before Fix:
- Only shows: DeVinci Codes (yourself)
- Total Users: 1

### After Fix:
- Shows both:
  1. **Taha Sheikh** - customer, onboarding complete, 0 applications
  2. **DeVinci Codes** - admin, onboarding pending, 0 applications
- Total Users: 2
- Pending Reviews: 8 (from Taha's uploaded documents)

## Technical Explanation

### What the Fix Does:

1. **Creates a SECURITY DEFINER function** (`is_admin()`)
   - Bypasses RLS when checking user role
   - Prevents circular reference
   - Returns true/false based on user's role

2. **Updates RLS policies** to use this function
   - Allows admins to see ALL records
   - Still allows users to see their own records
   - Works for all tables: profiles, onboarding_data, job_applications, documents, payments

### Why SECURITY DEFINER?
- Functions marked as `SECURITY DEFINER` run with the privileges of the function owner (superuser)
- This allows the function to bypass RLS and directly query the role
- It's safe because the function only returns a boolean, not the data itself

## Troubleshooting

### If you still only see 1 user:

1. **Check if you're logged in as admin:**
   ```sql
   SELECT email, role FROM profiles WHERE id = auth.uid();
   ```
   Should return: `devincicodes.official@gmail.com` with role `admin`

2. **Test the is_admin() function:**
   ```sql
   SELECT is_admin();
   ```
   Should return: `true`

3. **Check browser console** for errors:
   - Open Developer Tools (F12)
   - Look for any red error messages
   - Check the "Fetched users:" and "Users with counts:" console logs

4. **Clear cache and refresh:**
   - Hard refresh: Ctrl + Shift + R
   - Or clear browser cache completely

### If errors persist:

1. Make sure you ran ALL the SQL commands
2. Make sure you're using the correct Supabase project
3. Check that RLS is enabled on the profiles table
4. Verify your user actually has `role = 'admin'`

## Summary

✅ **Fixed:** RLS circular reference issue  
✅ **Created:** `is_admin()` helper function  
✅ **Updated:** All admin view policies  
✅ **Result:** Admin can now see all users and their data  

**Your admin dashboard will now show complete data for all users! 🎉**
