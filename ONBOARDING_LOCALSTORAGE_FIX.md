# Onboarding LocalStorage & Database Sync Fix

## Problem Summary

1. **Empty Personal Details**: Email, name, and phone were showing as empty strings in the database even after completing onboarding
2. **Document Upload Stuck**: The document upload process was hanging or failing
3. **LocalStorage Not Persisting**: Data was being cleared too early, causing loss of information on reload

## Root Causes

### 1. Empty Personal Details Issue
- **Cause**: Personal details were not being pre-filled from the user's profile when starting onboarding
- **Impact**: Users had to manually enter email/name/phone even though these were already in their profile
- **Result**: If users skipped or didn't fill these fields, empty strings were saved to database

### 2. Document Upload Stuck
- **Cause**: 
  - LocalStorage was being cleared BEFORE database save completed
  - Document metadata was being saved with file names instead of file paths
  - Database RLS policies might be causing timeouts (as indicated by the timeout warning in storage.js)
- **Impact**: Upload appeared to succeed but data was lost or incomplete

### 3. LocalStorage Not Syncing with Database
- **Cause**: 
  - Data was only saved to localStorage in some methods, not consistently
  - No automatic sync between localStorage and database after each step
- **Impact**: Reloading the page could show stale or empty data

## Solutions Implemented

### 1. Pre-fill Personal Details from User Profile

**File**: `context/OnboardingContext.js`

#### Changes:
- Added user email, name, and phone to the useEffect dependency array
- Modified `loadOnboardingData()` to pre-fill email from user profile if missing
- Modified `fetchFromDatabase()` to:
  - Pre-fill email, name, phone from user profile if missing in database
  - Initialize new users with their profile data instead of empty strings

```javascript
// Pre-fill email from user profile if missing in localStorage
if (!parsedData.personalDetails?.email && user?.email) {
  parsedData.personalDetails = {
    ...parsedData.personalDetails,
    email: user.email,
    fullName: parsedData.personalDetails?.fullName || user.name || '',
    telephone: parsedData.personalDetails?.telephone || user.phone || ''
  };
}
```

**File**: `pages/onboarding-new.js`

#### Changes:
- Modified the useEffect that loads data to pre-fill the form with user profile data if no existing onboarding data
- Checks if there's existing onboarding data first, then falls back to user profile

```javascript
const hasExistingData = onboardingData.personalDetails?.email || onboardingData.personalDetails?.fullName;

if (hasExistingData) {
  // Use existing onboarding data
  setPersonalForm({ ...onboardingData.personalDetails });
} else {
  // Pre-fill with user profile data
  setPersonalForm({
    fullName: user.name || '',
    email: user.email || '',
    telephone: user.phone || '',
    country: user.country || ''
  });
}
```

### 2. Fix Document Upload Process

**File**: `pages/onboarding-new.js`

#### Changes:
- Store file paths from successful uploads instead of file names
- Upload all files first, collect results, then save to database
- Move `clearLocalStorage()` to AFTER all database operations complete
- Save file paths (not file objects) to database

```javascript
// Collect upload results with file paths
const uploadResults = {
  passport: passportResult.filePath,
  educationalCertificates: [certResult.filePath, ...],
  experienceLetters: [expResult.filePath, ...],
  jobOffer: jobOfferResult.filePath
};

// Save to database
await uploadDocuments(uploadResults);
await markStepCompleted(5);

// Clear localStorage ONLY after everything is successful
clearLocalStorage();
```

### 3. Consistent LocalStorage + Database Sync

**File**: `context/OnboardingContext.js`

#### Changes:
- Modified ALL update methods to save to BOTH localStorage AND database
- Ensures data is immediately available on reload (localStorage) while also being backed up to database
- Order: State → LocalStorage → Database

Methods updated:
- `updatePersonalDetails()` - Added localStorage save
- `updateVisaCheck()` - Added localStorage save
- `setVisaEligibility()` - Added localStorage save + await database save
- `completePayment()` - Already had both
- `scheduleCall()` - Already had both
- `uploadDocuments()` - Already had both
- `setCurrentStep()` - Already had both
- `markStepCompleted()` - Already had both

```javascript
// Pattern used in all methods:
setOnboardingData(updatedData);

// Save to localStorage immediately (for reload persistence)
if (typeof window !== 'undefined') {
  localStorage.setItem('onboarding_data', JSON.stringify(updatedData));
}

// Save to database (for cross-device sync and backup)
await saveToDatabase(updatedData);
```

### 4. Update User Profile Along with Onboarding Data

**File**: `context/OnboardingContext.js`

#### Changes:
- Modified `updatePersonalDetails()` to also update the user's profile in the `profiles` table
- Now updates: `full_name`, `email`, `phone`, `country`
- This ensures profile data stays in sync with onboarding data

```javascript
// Also update the user's profile
const profileUpdates = {
  full_name: details.fullName,
  email: details.email,
  phone: details.telephone,
  country: details.address?.country
};

await supabase
  .from('profiles')
  .update(profileUpdates)
  .eq('id', user.id);
```

## Data Flow

### Before (Broken):
```
User Input → State → Database (maybe)
                  ↓
              LocalStorage (sometimes)
                  ↓
              Cleared too early
```

### After (Fixed):
```
User Input → State → LocalStorage (immediate) → Database (background)
                          ↓                          ↓
                    Always persists            Always backed up
                          ↓                          ↓
                    Available on reload      Available cross-device
```

## Testing Checklist

- [ ] Start new onboarding - email/name/phone should be pre-filled
- [ ] Complete personal details - data should save to localStorage
- [ ] Reload page - should resume from correct step with all data
- [ ] Complete all steps - database should have complete data
- [ ] Upload documents - should not hang or timeout
- [ ] Check database after upload - personal_details should have email/name/phone
- [ ] Check profiles table - should be updated with latest info
- [ ] Complete onboarding - dashboard should be accessible

## Database Verification Query

After completing onboarding, run this in Supabase SQL editor:

```sql
-- Check onboarding_data table
SELECT 
  user_id,
  relocation_type,
  personal_details->>'email' as email,
  personal_details->>'fullName' as full_name,
  personal_details->>'telephone' as phone,
  payment_completed,
  call_scheduled,
  documents_uploaded,
  completed_steps,
  current_step
FROM onboarding_data
WHERE user_id = 'YOUR_USER_ID';

-- Check profiles table
SELECT 
  id,
  email,
  full_name,
  phone,
  country,
  onboarding_complete
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

Expected results:
- `personal_details` should have valid email, fullName, telephone (not empty strings)
- `completed_steps` should be `[0, 1, 2, 3, 4, 5]` for Europe or `[0, 1, 3, 4, 5]` for GCC
- `current_step` should be `5`
- `payment_completed`, `call_scheduled`, `documents_uploaded` should all be `true`
- `profiles.onboarding_complete` should be `true`

## Known Issues & Future Improvements

### Potential RLS Policy Issue
The `storage.js` file has a 10-second timeout warning for database operations, suggesting potential RLS policy issues with the `documents` table. If document uploads continue to hang:

1. Check RLS policies on `documents` table
2. Ensure user has INSERT permission
3. Check for infinite recursion in RLS policies (similar to the previous onboarding_data issue)

### Recommended: Add Loading States
Consider adding loading states to each step to show users that data is being saved:
- "Saving to database..."
- "Uploading file X of Y..."
- "Finalizing onboarding..."

### Recommended: Add Error Recovery
If database save fails but localStorage succeeds:
- Show a warning to the user
- Retry database save on next page load
- Allow manual "Sync to Cloud" button

## Files Changed

1. `context/OnboardingContext.js` - Core data management
2. `pages/onboarding-new.js` - UI and form handling
3. `ONBOARDING_LOCALSTORAGE_FIX.md` - This documentation

## Rollback Plan

If issues occur, you can rollback by:
1. Reverting to the previous versions of these files from Git
2. Running `reset-onboarding.sql` to clean up test data
3. Clearing localStorage in browser DevTools: `localStorage.clear()`
