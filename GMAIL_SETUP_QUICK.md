# Gmail Integration Quick Setup Guide

## 🚀 Quick Start (5 Steps)

### Step 1: Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → Enable Gmail API
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `http://localhost:3000/api/gmail/callback`
5. Copy Client ID and Client Secret

### Step 2: Environment Variables
Add to `.env.local`:
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Database Setup
Run in Supabase SQL Editor:
```sql
-- Execute the entire setup-gmail-storage.sql file
```

### Step 4: Create Storage Buckets
In Supabase Dashboard → Storage:
1. Create bucket `cvs` (public, 10MB limit)
2. Create bucket `cover-letters` (public, 10MB limit)

### Step 5: Test the Flow
1. Upload CV and cover letter in customer dashboard
2. Go to Jobs page → Click cart icon
3. Click "Connect Gmail" → Authorize
4. Add jobs to cart → Select docs → Send!

## ✅ Verification

### Check Database
```sql
-- Verify table exists
SELECT * FROM gmail_accounts LIMIT 1;

-- Check storage buckets
SELECT * FROM storage.buckets WHERE name IN ('cvs', 'cover-letters');
```

### Check API Routes
```bash
# Test status endpoint
curl http://localhost:3000/api/gmail/status?email=test@example.com

# Test storage listing
curl http://localhost:3000/api/gmail/status?email=test@example.com
```

## 🐛 Common Issues

**OAuth redirect_uri_mismatch**
→ Ensure redirect URI in Google Console exactly matches: `http://localhost:3000/api/gmail/callback`

**gmail_accounts table not found**
→ Run `setup-gmail-storage.sql` in Supabase SQL Editor

**Buckets not found**
→ Create `cvs` and `cover-letters` buckets manually in Supabase Storage

**No CVs/Cover letters showing**
→ Upload files in customer dashboard first

## 📋 What You Get

✅ Gmail OAuth integration
✅ Job application cart system  
✅ CV and cover letter management  
✅ Bulk email sending via webhook  
✅ User data isolation with RLS  
✅ Token storage and refresh handling  

## 📚 Full Documentation

See `README_GMAIL_INTEGRATION.md` for complete details.

## 🔒 Security Notes

- Never commit `.env.local` to Git
- OAuth tokens stored encrypted in Supabase
- RLS policies ensure data isolation
- Storage buckets have user-level access control

## 🎯 Next Steps

After setup:
1. Test OAuth flow end-to-end
2. Upload test CV and cover letter
3. Create job request to get leads
4. Add jobs to cart
5. Send test application

---

**Need help?** Check the troubleshooting section in `README_GMAIL_INTEGRATION.md`
