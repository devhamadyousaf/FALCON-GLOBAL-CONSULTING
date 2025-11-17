# Falcon Global Consulting - Backend Documentation

## 🎯 Project Overview

Job Application Automation Platform with AI-driven CV customization and automated outreach to HR.

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  - Marketing Landing Page                                   │
│  - User Authentication (Email/Google OAuth)                 │
│  - Multi-step Onboarding                                    │
│  - Customer Dashboard                                       │
│  - Admin Dashboard                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE BACKEND (PostgreSQL)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AUTHENTICATION                                      │   │
│  │ - Email/Password Auth                               │   │
│  │ - Google OAuth                                      │   │
│  │ - Session Management                                │   │
│  │ - Role-Based Access Control                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ DATABASE (7 Tables)                                 │   │
│  │ - profiles (user accounts)                          │   │
│  │ - onboarding_data (progress tracking)               │   │
│  │ - Job-Leads (scraped jobs from n8n)                 │   │
│  │ - job_applications (user submissions)               │   │
│  │ - documents (file metadata)                         │   │
│  │ - payments (Stripe/PayPal records)                  │   │
│  │ - notifications (in-app alerts)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STORAGE (4 Buckets)                                 │   │
│  │ - documents (private) - passports, certificates     │   │
│  │ - cvs (private) - CV files                          │   │
│  │ - cover-letters (private) - cover letters           │   │
│  │ - avatars (public) - profile pictures               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ROW LEVEL SECURITY (RLS)                            │   │
│  │ - Users see only their own data                     │   │
│  │ - Admins see everything                             │   │
│  │ - Storage policies restrict file access             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────────────────┐
│                    n8n AUTOMATION                           │
│  - Job scraping (18 platforms)                             │
│  - HR email extraction                                     │
│  - CV customization (AI)                                   │
│  - Email outreach to HR                                    │
│  - Data sync to Supabase                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ├─── profiles (1:1)
    │       │
    │       ├─── onboarding_data (1:1)
    │       ├─── job_applications (1:many)
    │       ├─── documents (1:many)
    │       ├─── payments (1:many)
    │       └─── notifications (1:many)
    │
    └─── Job-Leads (scraped by n8n)
             │
             └─── job_applications (1:many)
```

### Table Details

| Table | Purpose | Key Fields | RLS |
|-------|---------|------------|-----|
| `profiles` | User accounts | email, full_name, role, onboarding_complete | ✅ |
| `onboarding_data` | Multi-step onboarding progress | relocation_type, personal_details, payment_completed | ✅ |
| `Job-Leads` | Scraped job listings from n8n | companyName, jobTitle, location, Status | ✅ |
| `job_applications` | User job submissions | user_id, job_id, status, cv_url | ✅ |
| `documents` | Uploaded file metadata | document_type, file_path, verified | ✅ |
| `payments` | Payment records | amount, payment_method, status, transaction_id | ✅ |
| `notifications` | In-app notifications | title, message, read, link | ✅ |

---

## 🔐 Authentication Flow

### Email/Password Signup

```
User enters email/password
         ↓
Supabase Auth creates user
         ↓
Trigger auto-creates profile
         ↓
User redirected to /onboarding-new
         ↓
User completes onboarding steps
         ↓
onboarding_complete = true
         ↓
Access /dashboard/customer
```

### Google OAuth Flow

```
User clicks "Continue with Google"
         ↓
Redirect to Google consent screen
         ↓
User authorizes
         ↓
Google redirects to Supabase callback
         ↓
Supabase creates session
         ↓
Redirect to /auth/callback
         ↓
Check if profile.onboarding_complete
         ├─ Yes → /dashboard/customer
         └─ No → /onboarding-new
```

---

## 📁 File Storage Structure

```
Storage Buckets:
├── documents/ (private)
│   └── {user_id}/
│       ├── passport/
│       │   └── 1234567890_abc123.pdf
│       ├── certificate/
│       │   └── 1234567891_def456.pdf
│       └── experience/
│           └── 1234567892_ghi789.pdf
│
├── cvs/ (private)
│   └── {user_id}/
│       ├── original_cv.pdf
│       └── customized_cv_job123.pdf
│
├── cover-letters/ (private)
│   └── {user_id}/
│       └── cover_letter_job123.pdf
│
└── avatars/ (public)
    └── {user_id}/
        └── profile_pic.jpg
```

---

## 🛠️ API Endpoints

### Public Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/jobs/listings` | GET | Get job listings with filters | ✅ |
| `/api/jobs/apply` | POST | Submit job application | ✅ |

### Admin Endpoints

| Endpoint | Method | Purpose | Auth Required | Role Required |
|----------|--------|---------|---------------|---------------|
| `/api/admin/users` | GET | Get all users | ✅ | admin |

### Example Requests

#### Get Job Listings
```bash
GET /api/jobs/listings?location=Dubai&jobTitle=Developer&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "jobs": [...],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

#### Apply to Job
```bash
POST /api/jobs/apply
Content-Type: application/json

{
  "jobId": "uuid-here",
  "userId": "user-uuid",
  "cvUrl": "path/to/cv.pdf",
  "coverLetterUrl": "path/to/cover.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "uuid",
    "status": "pending",
    "applied_at": "2025-01-11T..."
  }
}
```

---

## 🔧 Code Usage Examples

### Authentication

```javascript
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login, loginWithGoogle, signup } = useAuth();

  // Email/Password Login
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      router.push(result.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer');
    } else {
      alert(result.error);
    }
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    // User will be redirected to Google
  };

  // Signup
  const handleSignup = async () => {
    const result = await signup({
      email,
      password,
      fullName,
      phone,
      country
    });
    if (result.success) {
      router.push('/onboarding-new');
    }
  };
}
```

### Onboarding

```javascript
import { useOnboarding } from '../context/OnboardingContext';

function OnboardingStep1() {
  const {
    onboardingData,
    updatePersonalDetails,
    markStepCompleted,
    setCurrentStep
  } = useOnboarding();

  const handleNext = async () => {
    await updatePersonalDetails({
      fullName: 'John Doe',
      email: 'john@example.com',
      telephone: '+1234567890'
    });
    await markStepCompleted(1);
    await setCurrentStep(2);
  };
}
```

### File Upload

```javascript
import { uploadDocument, STORAGE_BUCKETS, DOCUMENT_TYPES } from '../lib/storage';

async function handleFileUpload(file) {
  const result = await uploadDocument(
    file,
    user.id,
    DOCUMENT_TYPES.PASSPORT,
    STORAGE_BUCKETS.DOCUMENTS
  );

  if (result.success) {
    console.log('File uploaded:', result.filePath);
    console.log('Document saved to DB:', result.document);
  } else {
    alert(result.error);
  }
}
```

### Direct Database Queries

```javascript
import { supabase } from '../lib/supabase';

// Get user's job applications
async function getMyApplications(userId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:Job-Leads (
        companyName,
        jobTitle,
        location
      )
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });

  return data;
}
```

---

## 🔒 Security Features

### Row Level Security (RLS) Policies

**Users can only access their own data:**
```sql
-- Example: job_applications table
CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);
```

**Admins can access all data:**
```sql
CREATE POLICY "Admins can view all applications"
  ON public.job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Storage Policies

**Users can only access their own files:**
```sql
CREATE POLICY "Users manage own files"
ON storage.objects FOR ALL
TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text);
```

---

## 🚀 Deployment Checklist

### Before Production

- [ ] Run `supabase-schema.sql` in production Supabase
- [ ] Configure Google OAuth with production URLs
- [ ] Create storage buckets in production
- [ ] Update `.env.local` with production credentials
- [ ] Test all authentication flows
- [ ] Test file uploads
- [ ] Verify RLS policies work
- [ ] Set up email templates in Supabase
- [ ] Configure production domain in Supabase settings
- [ ] Enable email confirmation (optional)
- [ ] Set up monitoring and alerts

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) | Full implementation details |
| [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) | Detailed Supabase configuration |
| [supabase-schema.sql](supabase-schema.sql) | Complete database schema |
| README_BACKEND.md | This file - architecture overview |

---

## 🔗 Key Files

### Backend Core
- [lib/supabase.js](lib/supabase.js) - Client-side Supabase client
- [lib/supabase-server.js](lib/supabase-server.js) - Server-side admin client
- [lib/storage.js](lib/storage.js) - File upload utilities

### Contexts
- [context/AuthContext.js](context/AuthContext.js) - Authentication state
- [context/OnboardingContext.js](context/OnboardingContext.js) - Onboarding state

### API Routes
- [pages/api/admin/users.js](pages/api/admin/users.js) - Admin user management
- [pages/api/jobs/listings.js](pages/api/jobs/listings.js) - Job listings
- [pages/api/jobs/apply.js](pages/api/jobs/apply.js) - Job applications

### Auth Pages
- [pages/auth/callback.js](pages/auth/callback.js) - OAuth callback handler

---

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Auth Guide](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

## 💡 Tips & Best Practices

1. **Always use RLS**: Never bypass Row Level Security in production
2. **Validate inputs**: Use `validateFile()` before uploads
3. **Use server routes**: For sensitive operations (payments, admin)
4. **Monitor quota**: Check Supabase dashboard regularly
5. **Handle errors**: Always check for errors in responses
6. **Test locally**: Test all flows before deploying
7. **Backup data**: Regular backups of production database

---

## 📞 Support

- **Supabase Discord**: https://discord.supabase.com
- **Documentation**: Check the docs files in this repo
- **Logs**: Supabase Dashboard → Logs section

---

**Version:** 1.0
**Last Updated:** January 2025
**Status:** ✅ Production Ready

---

Built with ❤️ for Falcon Global Consulting
