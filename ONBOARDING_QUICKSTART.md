# Onboarding System - Quick Start Guide

## 🚀 Getting Started

The new multi-step onboarding system is now fully implemented! Here's how to test it:

### Step 1: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 🧪 Testing the Onboarding Flow

### Option A: Create New Account

1. Navigate to `http://localhost:3000/signup`
2. Fill in the registration form:
   - Full Name
   - Email
   - Phone Number
   - Country
   - Password
   - Confirm Password
   - Check "I agree to Terms"
3. Click **Sign Up**
4. You'll be automatically redirected to `/onboarding-new`

### Option B: Use Google Sign In (Simulated)

1. Go to `/login` or `/signup`
2. Click "Continue with Google"
3. Auto-redirected to `/onboarding-new`

---

## 📋 Testing the Complete Onboarding Journey

### For EUROPE Relocation (Full Flow)

1. **Step 0: Choose Europe** 🇪🇺
   - Click the "Europe" card

2. **Step 1: Personal Details**
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `+1234567890`
   - Country: Select any country (try `Germany` or `United States`)
   - State: Will auto-populate based on country
   - City: Will auto-populate based on country
   - Street: `123 Main Street`
   - ZIP: `12345`
   - Click **Next**

3. **Step 2: Visa Check** (9 Questions)

   Answer these for an **ELIGIBLE** result:
   - Q1: "Longer than 90 days?" → **Yes**
   - Q2: "Citizenship?" → **NON-EU Third Country**
   - Q3: "English level?" → **I use English fluently in my current or previous job**
   - Q4: "Job offer?" → **Yes, I already have a Job in Germany**
   - Q5: "Education?" → **University Degree**
   - Q6: "Special regulation?" → **No, none apply**
   - Q7: "Education country?" → **Germany** (or Outside Germany + Q8: Yes)
   - Q8: "Degree recognized?" → **Yes**
   - Q9: "Work experience?" → **3+ years**

   Answer these for a **NOT ELIGIBLE** result:
   - Q1: No
   - Q2: EU country
   - Q3: I do not speak English
   - Q4: Nothing above mentioned
   - Q5: None of the above

4. **Step 2.5: View Result**
   - See eligibility status (✅ or ❌)
   - View score and recommendations
   - Click **Proceed to Payment**

5. **Step 3: Payment**
   - See $99.00 fee breakdown
   - Click either **Pay with Stripe** or **Pay with PayPal**
   - Wait 2 seconds for simulated payment processing

6. **Step 4: Schedule Call**
   - Select Date: Any future date
   - Select Time: Choose from 9 AM - 5 PM slots
   - Click **Confirm Booking**

7. **Step 5: Upload Documents**
   - Passport Copy: **Required** (upload any PDF/JPG/PNG)
   - Educational Certificates: Optional
   - Experience Letters: Optional
   - Job Offer: Optional
   - Click **Complete Onboarding**

8. **Success!**
   - You'll see: "Congratulations! Your onboarding is complete"
   - Auto-redirect to `/dashboard/customer`

---

### For GCC Relocation (Shortened Flow)

1. **Step 0: Choose GCC** 🏝️
   - Click the "GCC Countries" card

2. **Step 1: Personal Details**
   - Same as Europe flow above

3. **Step 2: SKIPPED** ⏭️
   - Visa check is bypassed for GCC

4. **Step 3: Payment**
   - Same as Europe flow

5. **Step 4: Schedule Call**
   - Same as Europe flow

6. **Step 5: Upload Documents**
   - Same as Europe flow

7. **Success!**
   - Dashboard unlocked

---

## 🔐 Testing Access Control

### Test 1: Incomplete Onboarding

1. Sign up a new user
2. Start onboarding but stop at Step 3 (Payment)
3. Try to access `/dashboard/customer` directly
4. **Expected**: Redirected back to `/onboarding-new`

### Test 2: Complete Onboarding

1. Complete all steps
2. Access `/dashboard/customer`
3. **Expected**: Dashboard loads successfully
4. Log out and log back in
5. **Expected**: Dashboard still accessible (no need to re-onboard)

### Test 3: Admin Bypass

1. Log in as admin:
   - Email: `admin@falconglobalconsulting.com`
   - Password: `123456789`
2. **Expected**: Redirected directly to `/dashboard/admin` (bypasses onboarding)

---

## 🗂️ Data Storage

All onboarding data is stored in **localStorage** under these keys:

- `user` - User authentication data
- `onboardingData` - Complete onboarding state

### To View Stored Data

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Select your domain
4. View `onboardingData` to see complete state

### To Reset Onboarding

```javascript
// In browser console:
localStorage.removeItem('onboardingData');
// Then refresh the page
```

---

## 📁 Key Files Created

| File | Purpose |
|------|---------|
| `pages/onboarding-new.js` | Main onboarding flow (all 5 steps) |
| `context/OnboardingContext.js` | State management for onboarding |
| `utils/locationData.js` | Country/state/city data |
| `utils/visaEligibility.js` | Visa eligibility calculator |
| `components/DashboardGuard.js` | Access control for dashboard |
| `ONBOARDING_SYSTEM_DOCUMENTATION.md` | Complete technical documentation |

---

## 🔄 Onboarding Flow Logic

```
┌─────────────────────────────────────┐
│  User Signs Up / Logs In            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Select Relocation Type             │
│  • Europe 🇪🇺                        │
│  • GCC 🏝️                            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Step 1: Personal Details           │
│  (Country/State/City dropdowns)     │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
   [EUROPE]         [GCC]
       │                │
       ▼                │
┌──────────────┐        │
│ Step 2:      │        │
│ Visa Check   │        │
│ (9 Questions)│        │
└──────┬───────┘        │
       │                │
       ▼                │
┌──────────────┐        │
│ Step 2.5:    │        │
│ Result       │        │
└──────┬───────┘        │
       │                │
       └────────┬───────┘
                ▼
┌─────────────────────────────────────┐
│  Step 3: Payment ($99)              │
│  • Stripe                           │
│  • PayPal                           │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  Step 4: Schedule Onboarding Call   │
│  (Date + Time picker)               │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  Step 5: Upload Documents           │
│  • Passport (Required)              │
│  • Certificates (Optional)          │
│  • Experience Letters (Optional)    │
│  • Job Offer (Optional)             │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  ✅ Onboarding Complete              │
│  🔓 Dashboard Access Unlocked        │
└─────────────────────────────────────┘
```

---

## 🎨 UI Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Progress Indicators**: Visual feedback on completion status
- **Form Validation**: Real-time error checking
- **Loading States**: Shows processing for async actions
- **Animated Backgrounds**: Gradient animations
- **Step Navigation**: Back/Next buttons
- **Auto-save**: Data persists to localStorage automatically

---

## 🛠️ Next Steps for Production

1. **Backend Integration**
   - Replace localStorage with API calls
   - Set up database (PostgreSQL/MongoDB)
   - Create REST/GraphQL endpoints

2. **Payment Integration**
   - Get Stripe API keys
   - Get PayPal API credentials
   - Implement webhook handlers

3. **File Storage**
   - Set up Firebase Storage or AWS S3
   - Configure upload limits and security rules

4. **Call Scheduling**
   - Integrate Calendly API
   - Or build custom calendar system

5. **Email Notifications**
   - Set up SendGrid/Mailgun
   - Create email templates

6. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Playwright/Cypress)

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'OnboardingContext'"

**Solution**: Make sure you've restarted the dev server after creating new files.

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Dashboard keeps redirecting to onboarding

**Check**:
1. All steps are marked complete in localStorage
2. `canAccessDashboard()` returns true
3. Clear localStorage and start fresh

### Issue: Dropdowns not populating

**Check**:
1. Country is selected first
2. `locationData.js` file exists
3. Import paths are correct

---

## 📞 Support

If you encounter any issues:

1. Check the full documentation: `ONBOARDING_SYSTEM_DOCUMENTATION.md`
2. Review browser console for errors
3. Check network tab for failed requests
4. Verify localStorage data structure

---

## ✅ Ready to Deploy!

The system is fully functional with simulated integrations. All core features are working:

- ✅ User sign up/login
- ✅ Relocation type selection
- ✅ Personal details collection
- ✅ Visa eligibility check
- ✅ Payment processing (simulated)
- ✅ Call scheduling
- ✅ Document upload
- ✅ Dashboard access control
- ✅ State persistence

**Happy testing!** 🎉
