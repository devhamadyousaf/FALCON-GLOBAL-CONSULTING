# Gmail OAuth Setup Instructions for GCP Console

## ✅ What I've Done

1. **Updated webhook URL** in `bulk-send.js` to:
   ```
   https://etgstkql.rcld.app/webhook/0da32b08-c8b9-492e-9805-628d6a23d972
   ```

2. **Hardcoded credentials** in callback handler:
   - Client ID: `76237042709-h892133umqi54o5cnbq56tgdsl5ojglk.apps.googleusercontent.com`
   - Client Secret: `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`

3. **Added token storage** to customer dashboard to save Gmail tokens in sessionStorage

4. **Enhanced debugging** in both connect and callback endpoints

---

## 🔧 What YOU Need to Do in GCP Console

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Navigate to Credentials
1. Click **APIs & Services** (left sidebar)
2. Click **Credentials**

### Step 3: Add Authorized Redirect URI
1. Find your OAuth 2.0 Client ID: `76237042709-h892133umqi54o5cnbq56tgdsl5ojglk`
2. Click on it to edit
3. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
4. Add this **EXACT** URL:
   ```
   http://localhost:3000/api/gmail/callback
   ```
5. Click **SAVE**

### Step 4: Enable Gmail API
1. Go to **APIs & Services** → **Library**
2. Search for **"Gmail API"**
3. Click on it
4. Click **ENABLE** (if not already enabled)

### Step 5: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Under **"Scopes"**, click **"ADD OR REMOVE SCOPES"**
3. Add these scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
4. Click **UPDATE**
5. Click **SAVE AND CONTINUE**

---

## 📋 Verification Checklist

- [ ] Redirect URI `http://localhost:3000/api/gmail/callback` is added
- [ ] Gmail API is enabled
- [ ] Required OAuth scopes are configured
- [ ] Client ID and Secret match your `.env.local` file
- [ ] Saved all changes in GCP Console

---

## 🧪 Testing the Flow

1. **Start your dev server**: `npm run dev`
2. **Navigate to**: http://localhost:3000/dashboard/services/jobs
3. **Click**: "Connect Gmail" button
4. **Authorize**: Google OAuth consent screen
5. **Check console logs** for detailed debugging info
6. **Verify**: Tokens are stored in sessionStorage
7. **Test**: Send bulk applications with webhook

---

## 📊 Data Flow

```
User clicks "Connect Gmail"
    ↓
GET /api/gmail/connect (builds OAuth URL)
    ↓
User authorizes on Google
    ↓
GET /api/gmail/callback (receives code)
    ↓
Exchange code for tokens
    ↓
Save tokens to Supabase (gmail_accounts table)
    ↓
Redirect with tokens in URL
    ↓
Customer dashboard stores tokens in sessionStorage
    ↓
User selects jobs and clicks "Send Applications"
    ↓
POST /api/jobs/bulk-send
    ↓
Sends data to webhook: https://etgstkql.rcld.app/webhook/0da32b08-c8b9-492e-9805-628d6a23d972
```

---

## 📦 Webhook Payload Format

Your webhook will receive:

```json
{
  "job_ids": [1, 2, 3],
  "user_email": "user@example.com",
  "gmail_account_id": 123,
  "access_token": "ya29.xxx...",
  "refresh_token": "1//xxx...",
  "cv_id": "uuid-cv",
  "cover_letter_id": "uuid-cover-letter",
  "timestamp": "2025-11-13T12:34:56.789Z"
}
```

---

## ⚠️ Important Notes

1. **Wait 2-5 minutes** after making changes in GCP Console for them to propagate
2. **Clear browser cache** if you encounter issues
3. **Check terminal logs** for detailed debugging information
4. **Tokens expire** - refresh token is used to get new access tokens
5. **For production**: 
   - Add your production domain redirect URI
   - Move credentials back to environment variables
   - Never commit hardcoded credentials to git

---

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"
- Double-check the redirect URI in GCP Console matches EXACTLY: `http://localhost:3000/api/gmail/callback`

### Error: "Email and tokens are required"
- Ensure tokens are being stored in sessionStorage after OAuth callback
- Check browser console for sessionStorage values

### Webhook not receiving data
- Verify webhook URL is correct
- Check network tab in browser dev tools
- Ensure webhook endpoint is accessible

---

## 🎯 Next Steps After Setup

1. Test the complete flow end-to-end
2. Verify webhook receives correct data format
3. Implement email sending logic on n8n/webhook side
4. Add error handling for expired tokens
5. Set up token refresh mechanism
