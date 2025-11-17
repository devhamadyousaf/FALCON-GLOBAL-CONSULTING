# Gmail Integration & Job Application Cart System

This document explains the complete setup for Gmail OAuth integration and bulk job application sending functionality.

## Overview

The system allows users to:
1. Connect their Gmail account via OAuth 2.0
2. Add job leads to a cart
3. Select CV and cover letter from their uploaded documents
4. Send bulk job applications via email through a webhook service

## Architecture

### Frontend Flow
1. User clicks "Apply" on job cards → Jobs added to cart (localStorage)
2. User clicks cart icon → Opens cart modal
3. If Gmail not connected → "Connect Gmail" button redirects to Google OAuth
4. User selects CV and cover letter from dropdowns
5. User clicks "Send Applications" → Bulk send to webhook

### Backend Flow
1. OAuth callback receives authorization code
2. Exchange code for access_token and refresh_token
3. Save tokens to `gmail_accounts` table in Supabase
4. Webhook receives: job_ids, email, tokens, cv_id, cover_letter_id
5. Webhook uses tokens to send emails on behalf of user

## Setup Instructions

### 1. Google OAuth Setup

#### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

#### Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Falcon Global Consulting
   - Support email: Your email
   - Scopes: Add Gmail scopes (will be configured automatically)
4. Application type: Web application
5. Authorized redirect URIs:
   ```
   http://localhost:3000/api/gmail/callback
   https://your-production-domain.com/api/gmail/callback
   ```
6. Click "Create"
7. Copy the Client ID and Client Secret

#### Add to Environment Variables
Add to your `.env.local` file:
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, use your production domain:
```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### 2. Database Setup

#### Run the Setup SQL
Execute the SQL script to create the `gmail_accounts` table:

```bash
# Using Supabase CLI
supabase db reset
# Or run the SQL directly in Supabase Dashboard SQL Editor
```

Execute the contents of `setup-gmail-storage.sql`

The script creates:
- `gmail_accounts` table with columns:
  - `id` (UUID, primary key)
  - `user_email` (TEXT, unique)
  - `gmail_address` (TEXT)
  - `access_token` (TEXT)
  - `refresh_token` (TEXT)
  - `token_expires_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- RLS policies for user data isolation
- Indexes for performance

#### Verify Table Creation
```sql
SELECT * FROM gmail_accounts;
```

### 3. Storage Buckets Setup

#### Create Buckets in Supabase Dashboard
1. Go to Supabase Dashboard → Storage
2. Create bucket: **cvs**
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. Create bucket: **cover-letters**
   - Public: ✅ Yes
   - File size limit: 10 MB
   - Allowed MIME types: Same as CVs

#### Apply Storage Policies
The SQL script in `setup-gmail-storage.sql` includes storage RLS policies.
These ensure users can only access their own documents.

Policies created:
- Users can upload files to `{bucket}/{userId}/`
- Users can view/download only their own files
- Users can delete only their own files
- Users can update only their own files

### 4. API Routes

The following API routes have been created:

#### `/api/gmail/connect`
- **Method**: GET
- **Query**: `?email=user@example.com`
- **Returns**: OAuth authorization URL
- **Purpose**: Generate Google OAuth URL for user to authorize

#### `/api/gmail/callback`
- **Method**: GET
- **Query**: `?code=auth_code&state=email`
- **Returns**: Redirect to jobs page
- **Purpose**: Exchange authorization code for tokens, save to database

#### `/api/gmail/status`
- **Method**: GET
- **Query**: `?email=user@example.com`
- **Returns**: `{ connected: boolean, gmailAddress: string, id: string }`
- **Purpose**: Check if user has connected Gmail

#### `/api/jobs/bulk-send`
- **Method**: POST
- **Body**:
  ```json
  {
    "jobIds": ["uuid1", "uuid2"],
    "email": "user@example.com",
    "accessToken": "ya29.xxx",
    "refreshToken": "1//xxx",
    "gmailAccountId": "uuid",
    "cvId": "file-id",
    "coverLetterId": "file-id"
  }
  ```
- **Returns**: `{ success: boolean, message: string }`
- **Purpose**: Forward application data to webhook

#### `/api/storage/list`
- **Method**: GET
- **Query**: `?userId=uuid&bucket=cvs`
- **Returns**: `{ success: boolean, files: [...] }`
- **Purpose**: List user's uploaded CVs or cover letters

### 5. Frontend Components

#### State Variables Added to `[serviceId].js`
```javascript
const [cart, setCart] = useState([]);
const [gmailConnected, setGmailConnected] = useState(false);
const [gmailAccountId, setGmailAccountId] = useState('');
const [showCartModal, setShowCartModal] = useState(false);
const [sendingApplications, setSendingApplications] = useState(false);
const [selectedCv, setSelectedCv] = useState('');
const [selectedCoverLetter, setSelectedCoverLetter] = useState('');
const [cvs, setCvs] = useState([]);
const [coverLetters, setCoverLetters] = useState([]);
```

#### Key Functions
1. **handleConnectGmail()** - Redirects to OAuth
2. **addToCart(job)** - Add/remove jobs from cart
3. **clearCart()** - Empty cart
4. **handleBulkSend()** - Send all applications

#### UI Elements
1. **Apply Button** - On each job card
2. **Cart Icon** - In header with badge showing count
3. **Send Applications Button** - Shows when cart has items and Gmail connected
4. **Cart Modal** - Shows:
   - Gmail connection status
   - CV selection dropdown
   - Cover letter selection dropdown
   - List of jobs in cart
   - Clear cart and send buttons

## Usage Flow

### User Journey
1. **Upload Documents** (Dashboard → Customer Page)
   - Upload CV in "My CVs" section
   - Upload cover letter in "Cover Letters" section

2. **Connect Gmail** (Dashboard → Jobs)
   - Click cart icon
   - Click "Connect Gmail" button
   - Authorize Google OAuth
   - Redirected back to jobs page

3. **Browse & Add Jobs**
   - View job leads filtered by email and status
   - Click "Apply" to add to cart
   - Click "Remove" to remove from cart

4. **Send Applications**
   - Click cart icon to open modal
   - Select CV from dropdown
   - Select cover letter from dropdown
   - Review jobs in cart
   - Click "Send X Applications"
   - Applications sent via webhook

### Data Flow
```
User Action (Apply) 
  → localStorage (cart storage)
  → Cart Modal (display)
  → handleBulkSend()
  → /api/jobs/bulk-send
  → Webhook (https://etgstkql.rcld.app/webhook/9ce7564c-...)
  → Email Sending Service
```

## Webhook Integration

### Webhook Endpoint
```
POST https://etgstkql.rcld.app/webhook/9ce7564c-363b-477c-8c26-297e208d0806
```

### Payload Format
```json
{
  "jobIds": ["uuid-1", "uuid-2", "uuid-3"],
  "email": "tahasheikh111.ts@gmail.com",
  "accessToken": "ya29.a0AfB_...",
  "refreshToken": "1//0gZ...",
  "gmailAccountId": "uuid",
  "cvId": "path/to/cv.pdf",
  "coverLetterId": "path/to/cover-letter.pdf"
}
```

### Expected Webhook Behavior
The webhook should:
1. Receive job IDs and user credentials
2. Fetch job details from "Job-Leads" table
3. Download CV and cover letter from Supabase storage
4. Use Gmail API with provided tokens to send emails
5. Handle token refresh if access_token expired
6. Return success/failure response

## Security Considerations

### OAuth Tokens
- Access tokens expire after 1 hour
- Refresh tokens are long-lived (can be revoked by user)
- Tokens stored in database encrypted at rest (Supabase default)
- Tokens passed to webhook via HTTPS only

### Storage Access
- RLS policies ensure users see only their own files
- File paths use `userId` to isolate user data
- Public buckets allow direct download but RLS limits listing

### Database Access
- RLS policies on `gmail_accounts` table
- Users can only access their own OAuth tokens
- Admin client used for webhook integration (server-side only)

### Environment Variables
Never commit to version control:
- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### OAuth Errors
**Error: redirect_uri_mismatch**
- Ensure redirect URI in Google Console matches exactly: `http://localhost:3000/api/gmail/callback`
- Check `NEXT_PUBLIC_APP_URL` environment variable

**Error: invalid_client**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check if Gmail API is enabled in Google Cloud Console

### Database Errors
**Error: relation "gmail_accounts" does not exist**
- Run `setup-gmail-storage.sql` in Supabase SQL Editor
- Verify table creation: `SELECT * FROM gmail_accounts;`

**Error: permission denied**
- Check RLS policies on `gmail_accounts` table
- Verify user is authenticated (check JWT token)

### Storage Errors
**Error: Bucket not found**
- Create `cvs` and `cover-letters` buckets in Supabase Dashboard
- Verify bucket names are exact (lowercase, hyphenated)

**Error: new row violates row-level security policy**
- Check storage RLS policies are applied
- Verify file path includes `userId`: `cvs/{userId}/file.pdf`

### Cart Not Persisting
- Check browser localStorage: `localStorage.getItem('job_cart_{email}')`
- Ensure user is logged in and email is available
- Clear localStorage and try again

### Bulk Send Fails
**Missing tokens in sessionStorage**
- Tokens should be set during OAuth callback
- Re-connect Gmail account if tokens missing

**Invalid CV/Cover Letter**
- Ensure documents are uploaded in customer dashboard
- Check `/api/storage/list` returns files correctly

## Testing

### Manual Testing Checklist
- [ ] Upload CV in customer dashboard
- [ ] Upload cover letter in customer dashboard
- [ ] Click "Connect Gmail" button
- [ ] Complete OAuth flow and verify redirect
- [ ] Check `gmail_accounts` table has new row
- [ ] Add jobs to cart via "Apply" button
- [ ] Open cart modal and verify jobs listed
- [ ] Select CV and cover letter from dropdowns
- [ ] Click "Send Applications"
- [ ] Verify success message
- [ ] Check webhook received correct payload

### API Testing
```bash
# Test Gmail status
curl http://localhost:3000/api/gmail/status?email=test@example.com

# Test storage list
curl http://localhost:3000/api/storage/list?userId=uuid&bucket=cvs

# Test job leads
curl http://localhost:3000/api/jobs/leads?email=tahasheikh111.ts@gmail.com&status=NEW
```

## Future Enhancements

### Potential Features
1. **Token Auto-Refresh**: Implement background job to refresh tokens before expiry
2. **Email Templates**: Allow users to customize application email templates
3. **Application Tracking**: Store sent applications in database with status
4. **Retry Logic**: Automatic retry for failed email sends
5. **Rate Limiting**: Prevent spam by limiting applications per hour
6. **Email Preview**: Show email preview before sending
7. **Batch Status**: Real-time progress indicator for bulk sends
8. **Gmail Disconnection**: Allow users to revoke access and remove tokens

## File Reference

### API Routes
- `/pages/api/gmail/connect.js` - OAuth URL generator
- `/pages/api/gmail/callback.js` - OAuth callback handler
- `/pages/api/gmail/status.js` - Connection status checker
- `/pages/api/jobs/bulk-send.js` - Webhook forwarder
- `/pages/api/storage/list.js` - File listing

### Frontend Pages
- `/pages/dashboard/services/[serviceId].js` - Main jobs page with cart system
- `/pages/dashboard/customer.js` - Document upload page

### Database Scripts
- `/setup-gmail-storage.sql` - Complete setup script
- `/supabase-schema.sql` - Main database schema

### Documentation
- `/README_GMAIL_INTEGRATION.md` - This file

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs for backend errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Ensure Google OAuth credentials are correct

## License

This feature is part of Falcon Global Consulting platform.
