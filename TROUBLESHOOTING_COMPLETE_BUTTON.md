# Troubleshooting: Complete Button Not Working

## Overview
This guide helps troubleshoot the "Complete" button in the admin dashboard that marks user onboarding as complete.

---

## Changes Made for Debugging

### 1. Added Comprehensive Logging
**Frontend (Admin Dashboard):**
- Logs when button is clicked
- Logs user ID and onboarding status
- Logs session data retrieval
- Logs API request and response
- Logs data refresh process

**Backend (API Endpoint):**
- Logs all incoming requests
- Logs authentication steps
- Logs database queries
- Logs success/failure states

### 2. Added Loading State
- Button shows "Updating..." while processing
- Button is disabled during update
- Prevents multiple clicks

### 3. Enhanced Error Messages
- More descriptive error alerts
- Console logs for debugging
- Error details in responses

---

## How to Debug

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the "Console" tab
3. Click the "Complete" button
4. Watch for log messages

### Step 2: Check Frontend Logs
Look for these messages in the console:

```
=== handleUpdateUserStatus called ===
User ID: [some-uuid]
Onboarding Complete: true
Session data: [object]
Token available: true
Making API request...
Response status: [200 or error code]
Response data: [object]
Refreshing user data...
User data refreshed successfully
=== handleUpdateUserStatus completed ===
```

### Step 3: Check Backend Logs
If using local development, check your terminal/server logs for:

```
=== Update User Status API Called ===
Method: POST
Headers: [object]
Body: { userId: '...', onboardingComplete: true }
Auth header present: true
Token extracted, length: [number]
Auth user: [user-id] Error: null
Profile: { role: 'admin' } Error: null
Request params - userId: [...] onboardingComplete: true
Updating profile for user: [...]
Update result: [object] Error: null
Successfully updated user status
```

---

## Common Issues & Solutions

### Issue 1: Nothing Happens When Clicking Button
**Symptoms:**
- No console logs appear
- Button doesn't change to "Updating..."

**Possible Causes:**
1. JavaScript error preventing execution
2. Button event handler not attached

**Solutions:**
- Check browser console for JavaScript errors
- Refresh the page (Ctrl+F5)
- Clear browser cache
- Check if `handleUpdateUserStatus` function is defined

---

### Issue 2: "No authentication token" Error
**Symptoms:**
- Console shows: `Error: No authentication token available`
- Alert shows authentication error

**Possible Causes:**
1. Session expired
2. Not logged in
3. Supabase session not initialized

**Solutions:**
1. **Logout and Login Again:**
   - Click logout button
   - Login with admin credentials
   - Try again

2. **Check Session:**
   ```javascript
   // Open browser console and run:
   const { data } = await supabase.auth.getSession();
   console.log('Session:', data);
   ```

3. **Verify Admin Role:**
   - Make sure you're logged in as admin
   - Check profiles table: `role = 'admin'`

---

### Issue 3: API Returns 401 Unauthorized
**Symptoms:**
- Response status: 401
- Error: "Unauthorized - Invalid token"

**Possible Causes:**
1. Token expired
2. Invalid token format
3. Supabase service role key not configured

**Solutions:**
1. **Re-authenticate:**
   - Logout and login again

2. **Check Environment Variables:**
   - Verify `.env.local` has:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
   - Restart development server after changes

3. **Verify Service Role Key:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy service_role key (not anon key!)
   - Update SUPABASE_SERVICE_ROLE_KEY

---

### Issue 4: API Returns 403 Forbidden
**Symptoms:**
- Response status: 403
- Error: "Forbidden: Admin access required"

**Possible Causes:**
1. User doesn't have admin role
2. Profile not found

**Solutions:**
1. **Check User Role in Database:**
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
   ```
   - Should show: `role: 'admin'`

2. **Update Role if Needed:**
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

3. **Verify Profile Exists:**
   - Make sure user has entry in profiles table
   - If not, create one or re-register

---

### Issue 5: API Returns 400 Bad Request
**Symptoms:**
- Response status: 400
- Error: "Missing required fields"

**Possible Causes:**
1. userId not being sent
2. onboardingComplete not being sent
3. Request body malformed

**Solutions:**
1. **Check Console Logs:**
   - Look for "Request params - userId: ..."
   - Verify both values are present

2. **Check Network Tab:**
   - Open Developer Tools → Network
   - Find the request to `/api/admin/update-user-status`
   - Check "Payload" or "Request" tab
   - Should show:
     ```json
     {
       "userId": "uuid-here",
       "onboardingComplete": true
     }
     ```

---

### Issue 6: API Returns 500 Internal Server Error
**Symptoms:**
- Response status: 500
- Error: "Failed to update user status" or "Internal server error"

**Possible Causes:**
1. Database connection issue
2. Invalid userId (user doesn't exist)
3. Database permissions issue
4. Supabase RLS policies blocking update

**Solutions:**
1. **Check Server Logs:**
   - Look for detailed error message
   - Look for database error details

2. **Verify User Exists:**
   ```sql
   SELECT * FROM profiles WHERE id = 'user-id-here';
   ```

3. **Check RLS Policies:**
   - Go to Supabase Dashboard
   - Database → Policies
   - Make sure service role can update profiles
   - Or temporarily disable RLS for testing:
     ```sql
     ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
     -- Test, then re-enable:
     ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
     ```

4. **Check Onboarding Data Table:**
   - Verify table exists
   - Check for constraints that might fail
   - Look for trigger errors

---

### Issue 7: Update Succeeds But User List Doesn't Refresh
**Symptoms:**
- Success alert shows
- But status badge still shows "Pending"
- Button still shows "Complete"

**Possible Causes:**
1. Data refresh failed
2. Cache issue
3. State not updating

**Solutions:**
1. **Manual Refresh:**
   - Refresh the page (F5)
   - Check if status updated

2. **Check Console for Refresh Errors:**
   - Look for errors after "Refreshing user data..."
   - Check if fetchRecentUsers/fetchAllUsers failed

3. **Verify Database:**
   ```sql
   SELECT id, email, onboarding_complete FROM profiles WHERE id = 'user-id';
   ```
   - If `onboarding_complete = true`, update worked
   - Issue is just UI refresh

---

## Testing Checklist

Use this checklist to verify the feature is working:

### Basic Functionality
- [ ] Button appears for users with `onboarding_complete = false`
- [ ] Button doesn't appear for users with `onboarding_complete = true`
- [ ] Clicking button shows "Updating..." text
- [ ] Button is disabled during update
- [ ] Success alert appears after update
- [ ] User list refreshes automatically
- [ ] Status badge changes to "Active"
- [ ] Button disappears after successful update

### Console Logs
- [ ] Frontend logs appear when clicking button
- [ ] API logs appear in server console
- [ ] No error messages in console
- [ ] All steps complete successfully

### Database Verification
- [ ] `profiles.onboarding_complete` updated to `true`
- [ ] `profiles.updated_at` timestamp updated
- [ ] `onboarding_data` record created (if didn't exist)
- [ ] `onboarding_data.current_step` = 4
- [ ] `onboarding_data.completed_steps` = [0,1,2,3,4]

### User Experience
- [ ] User can login after update
- [ ] User redirects to customer dashboard (not onboarding)
- [ ] User has full access to features

---

## Quick Diagnosis Commands

### Check Current Session (Browser Console)
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('User:', session?.user?.email);
console.log('Token length:', session?.access_token?.length);
```

### Check User Role (Browser Console)
```javascript
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session.user.id)
  .single();
console.log('Role:', profile?.role);
```

### Test API Directly (Browser Console)
```javascript
const { data: sessionData } = await supabase.auth.getSession();
const token = sessionData?.session?.access_token;

const response = await fetch('/api/admin/update-user-status', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 'paste-user-id-here',
    onboardingComplete: true
  })
});

const result = await response.json();
console.log('Status:', response.status);
console.log('Result:', result);
```

---

## Expected Console Output (Success Case)

### Frontend Console
```
=== handleUpdateUserStatus called ===
User ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
Onboarding Complete: true
Session data: {session: {...}}
Token available: true
Making API request...
Response status: 200
Response data: {success: true, message: "...", profile: {...}}
Refreshing user data...
User data refreshed successfully
=== handleUpdateUserStatus completed ===
```

### Backend Console (Server)
```
=== Update User Status API Called ===
Method: POST
Headers: {authorization: "Bearer ...", ...}
Body: {userId: "...", onboardingComplete: true}
Auth header present: true
Token extracted, length: 500+
Auth user: a1b2c3d4-... Error: null
Profile: {role: "admin"} Error: null
Request params - userId: a1b2c3d4-... onboardingComplete: true
Updating profile for user: a1b2c3d4-...
Update result: {id: "...", onboarding_complete: true, ...} Error: null
Successfully updated user status
```

---

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Share the Console Logs:**
   - Copy all console output
   - Share in issue/support request

2. **Check Network Tab:**
   - Developer Tools → Network
   - Filter: `update-user-status`
   - Click on the request
   - Share: Headers, Payload, Response

3. **Verify Environment:**
   - Next.js version
   - Supabase client version
   - Node.js version

4. **Try Different Browser:**
   - Test in incognito mode
   - Test in different browser
   - Clear all cache and cookies

5. **Check Supabase Dashboard:**
   - Go to Supabase Logs
   - Check for API errors
   - Check for database errors

---

**Last Updated:** December 18, 2025
**Version:** 1.0
