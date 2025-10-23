# Multi-Step Onboarding and Visa Eligibility System

## Overview

This document describes the comprehensive multi-step onboarding and visa eligibility system for FALCON GLOBAL CONSULTING. The system filters users based on their relocation destination (Europe vs GCC), collects personal details, validates visa eligibility, processes payments, and restricts dashboard access until all steps are complete.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Flow](#user-flow)
3. [Components](#components)
4. [State Management](#state-management)
5. [Step-by-Step Breakdown](#step-by-step-breakdown)
6. [Access Control](#access-control)
7. [Integration Points](#integration-points)
8. [Testing Guide](#testing-guide)
9. [Future Enhancements](#future-enhancements)

---

## System Architecture

### Tech Stack
- **Frontend Framework**: Next.js 15.5.4 with React 19.1.0
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Persistence**: localStorage (for demo; can be replaced with backend API)

### File Structure

```
FALCON-GLOBAL-CONSULTING/
├── pages/
│   ├── onboarding-new.js          # Main onboarding flow
│   ├── login.js                   # Updated with new onboarding redirect
│   ├── signup.js                  # Updated with new onboarding redirect
│   └── dashboard/
│       └── customer.js            # Protected with DashboardGuard
├── context/
│   ├── AuthContext.js             # User authentication
│   └── OnboardingContext.js       # Onboarding state management
├── components/
│   └── DashboardGuard.js          # Access control component
└── utils/
    ├── locationData.js            # Country/state/city data
    └── visaEligibility.js         # Visa eligibility calculator
```

---

## User Flow

### High-Level Flow

```
Sign Up / Sign In
       ↓
Relocation Type Selection (Europe or GCC)
       ↓
Personal Details Collection
       ↓
[IF EUROPE] → Visa Check (9 Questions) → Eligibility Result
[IF GCC] → Skip Visa Check
       ↓
Payment Gateway ($99 onboarding fee)
       ↓
Schedule Onboarding Call
       ↓
Upload Documents
       ↓
Dashboard Access Unlocked ✅
```

### Detailed User Journey

1. **New User Signs Up** → Redirected to `/onboarding-new`
2. **Existing User Logs In** →
   - If onboarding incomplete → Redirected to `/onboarding-new`
   - If onboarding complete → Redirected to dashboard
3. **Admin Users** → Bypass onboarding, direct dashboard access

---

## Components

### 1. OnboardingContext (`context/OnboardingContext.js`)

**Purpose**: Manages all onboarding state and progress tracking

**Key Features**:
- Persists data to localStorage
- Tracks completion status of each step
- Provides methods to update different sections
- Validates dashboard access eligibility

**Main Methods**:
```javascript
setRelocationType(type)              // Set 'europe' or 'gcc'
updatePersonalDetails(details)       // Save personal info
updateVisaCheck(visaData)            // Save visa answers
setVisaEligibility(result)           // Set 'eligible' or 'not_eligible'
completePayment(paymentDetails)      // Mark payment complete
scheduleCall(callDetails)            // Mark call scheduled
uploadDocuments(documents)           // Mark documents uploaded
canAccessDashboard()                 // Check if all steps complete
```

**State Structure**:
```javascript
{
  relocationType: 'europe' | 'gcc',
  personalDetails: { fullName, email, telephone, address },
  visaCheck: { ...9 questions },
  visaEligibilityResult: 'eligible' | 'not_eligible' | null,
  paymentCompleted: boolean,
  paymentDetails: { method, amount, transactionId, ... },
  onboardingCallScheduled: boolean,
  callScheduleDetails: { date, time, timezone, ... },
  documentsUploaded: boolean,
  documents: { passport, educationalCertificates, ... },
  currentStep: number,
  completedSteps: [array of step numbers]
}
```

---

### 2. DashboardGuard (`components/DashboardGuard.js`)

**Purpose**: Protects dashboard routes from unauthorized access

**Logic**:
- Checks if user is authenticated
- Checks if user is admin (admins bypass onboarding)
- Checks if customer has completed onboarding via `canAccessDashboard()`
- Redirects to `/onboarding-new` if incomplete
- Shows loading state during checks

**Usage**:
```javascript
// Wrap your dashboard page
export default function DashboardPage() {
  return (
    <DashboardGuard>
      <YourDashboardComponent />
    </DashboardGuard>
  );
}
```

---

### 3. Location Data Utilities (`utils/locationData.js`)

**Purpose**: Provides country, state, and city data for dropdowns

**Exports**:
- `countries` - Array of all supported countries
- `statesByCountry` - Object mapping country codes to states/provinces
- `citiesByCountry` - Object mapping country codes to major cities
- `getStatesForCountry(countryCode)` - Helper function
- `getCitiesForCountry(countryCode)` - Helper function
- `isEuropeanCountry(countryCode)` - Check if country is in Europe
- `isGCCCountry(countryCode)` - Check if country is in GCC

**Example**:
```javascript
import { countries, getStatesForCountry } from '../utils/locationData';

const states = getStatesForCountry('US'); // Returns US states
```

---

### 4. Visa Eligibility Calculator (`utils/visaEligibility.js`)

**Purpose**: Calculates EU Blue Card visa eligibility based on user responses

**Main Function**: `calculateVisaEligibility(visaCheckData)`

**Returns**:
```javascript
{
  eligible: boolean,
  reasons: [array of ineligibility reasons],
  recommendation: string
}
```

**Eligibility Criteria**:
- ✅ Plans to stay >90 days in Germany
- ✅ Non-EU citizenship (EU citizens don't need Blue Card)
- ✅ At least basic English proficiency
- ✅ Has binding job offer in Germany
- ✅ Has recognized university degree or equivalent
- ✅ Degree is recognized in Germany (if obtained outside Germany)

**Scoring Function**: `getEligibilityScore(visaCheckData)`
- Returns a score from 0-100
- Used for displaying progress/confidence level

---

## Step-by-Step Breakdown

### Step 0: Relocation Type Selection

**Location**: `/onboarding-new` (currentMainStep === 0)

**Options**:
1. **Europe** (🇪🇺)
   - Includes visa eligibility check
   - Focus on Germany/EU Blue Card
2. **GCC** (🏝️)
   - Skips visa check
   - For UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman

**Validation**: User must select one option

**Next Step**:
- Both → Step 1 (Personal Details)

---

### Step 1: Personal Details

**Location**: `/onboarding-new` (currentMainStep === 1)

**Required Fields**:
- Full Name
- Email (with format validation)
- Telephone
- Address:
  - Country (dropdown)
  - Street Address
  - State/Province (auto-populated based on country)
  - City (auto-populated based on country)
  - ZIP/Postal Code

**Features**:
- Cascading dropdowns (Country → State → City)
- Real-time validation
- Error messages for invalid inputs
- Progress indicator

**Validation**:
- All fields required
- Email must be valid format
- Phone number must be provided

**Next Step**:
- Europe → Step 2 (Visa Check)
- GCC → Step 3 (Payment)

---

### Step 2: Visa Check (Europe Only)

**Location**: `/onboarding-new` (currentMainStep === 2)

**Format**: Sequential questions (one per screen)

**Questions**:

1. **Stay Duration**
   - "Would you like to stay in Germany for longer than 90 days?"
   - Options: Yes / No

2. **Citizenship**
   - "Which answer applies to your citizenship or passport?"
   - Options: NON-EU / EU country / Visa-exempt countries

3. **English Proficiency**
   - "How well do you speak English for professional work?"
   - Options: Fluent / Basic / Learning / Don't speak

4. **Job Offer**
   - "Do you have a binding Job Offer/Employment Contract in Germany?"
   - Options: Have job / Getting job / Will search / None

5. **Education**
   - "What is your highest educational qualification?"
   - Options: University degree / Vocational training / Tertiary education / IT experience (2+ years) / IT experience (3+ years) / None

6. **Special Regulation**
   - "Is there a special regulation for your employment relationship in Germany?"
   - Options: Internal transfer / Placement agreement / None

7. **Education Country**
   - "In which country did you obtain your educational qualification?"
   - Options: Germany / Outside Germany

8. **Degree Recognition**
   - "Is your degree recognised in Germany?"
   - Options: Yes / No

9. **Work Experience**
   - "How many years of full-time experience do you have in your current profession?"
   - Options: 0-2 years / 3+ years

**Navigation**:
- Back button (returns to previous question or personal details)
- Next button (advances to next question)
- Disabled until answer selected

**Next Step**: Step 2.5 (Visa Result)

---

### Step 2.5: Visa Eligibility Result

**Location**: `/onboarding-new` (currentMainStep === 2.5)

**Display**:

**If Eligible** (✅):
- Green success icon
- "Congratulations! You are eligible for the EU Blue Card visa"
- Eligibility score percentage
- Positive recommendation message

**If Not Eligible** (❌):
- Red alert icon
- "You may not qualify for an EU Blue Card visa"
- List of specific issues/concerns
- Recommendation to contact support for alternatives

**Actions**:
- "Proceed to Payment" button (regardless of result)
- User can continue onboarding even if not eligible

**Next Step**: Step 3 (Payment)

---

### Step 3: Payment Gateway

**Location**: `/onboarding-new` (currentMainStep === 3)

**Fee**: $99.00 USD

**Included Services**:
- ✅ Personal consultation call
- ✅ Document review and guidance
- ✅ Visa application support
- ✅ Dashboard access to track progress

**Payment Options**:
1. **Stripe** (blue button)
2. **PayPal** (blue button)

**Implementation**:
- Currently simulated (2-second delay)
- Generates mock transaction ID
- Stores payment details in onboarding context

**Next Step**: Step 4 (Schedule Call)

---

### Step 4: Onboarding Call Scheduling

**Location**: `/onboarding-new` (currentMainStep === 4)

**Required Fields**:
- Date (must be today or future)
- Time (dropdown with hourly slots 9 AM - 5 PM)

**Call Duration**: 30 minutes

**Purpose**:
- Review application
- Answer questions
- Provide relocation guidance

**Integration**:
- Currently custom date/time selector
- Can be replaced with Calendly API embed
- Stores timezone automatically

**Validation**:
- Both date and time must be selected

**Next Step**: Step 5 (Document Upload)

---

### Step 5: Document Upload

**Location**: `/onboarding-new` (currentMainStep === 5)

**Required Documents**:
1. **Passport Copy** (Required) *
   - Formats: PDF, JPG, PNG
   - Max size: 10MB

**Optional Documents**:
2. **Educational Certificates**
   - Multiple files allowed
   - Formats: PDF, JPG, PNG

3. **Experience Letters**
   - Multiple files allowed
   - Formats: PDF, JPG, PNG

4. **Job Offer** (if applicable)
   - Single file
   - Formats: PDF, JPG, PNG

**Features**:
- File upload inputs
- Visual confirmation when file selected (green checkmark)
- File name and size display
- Warning message about accepted formats

**Storage**:
- Currently stores file metadata only
- Ready for Firebase Storage or AWS S3 integration

**Validation**:
- Passport copy is mandatory

**Final Action**:
- "Complete Onboarding" button
- Simulates upload (2-second delay)
- Shows success message
- Redirects to `/dashboard/customer`

---

## Access Control

### Dashboard Protection Logic

```javascript
canAccessDashboard() {
  const { relocationType, completedSteps, paymentCompleted,
          onboardingCallScheduled, documentsUploaded } = onboardingData;

  if (relocationType === 'gcc') {
    // GCC: Need payment, call, and documents (skip visa check)
    return paymentCompleted && onboardingCallScheduled && documentsUploaded;
  }

  if (relocationType === 'europe') {
    // Europe: Need ALL steps
    return (
      completedSteps.includes(1) &&  // Personal details
      completedSteps.includes(2) &&  // Visa check
      paymentCompleted &&
      onboardingCallScheduled &&
      documentsUploaded
    );
  }

  return false; // No relocation type selected
}
```

### Protected Routes

The following routes are protected with `DashboardGuard`:
- `/dashboard/customer`
- `/dashboard/jobs`
- `/dashboard/services/[serviceId]`

**Admin Routes**:
- `/dashboard/admin` - Admins bypass onboarding checks

---

## Integration Points

### 1. Real Backend API

Currently, the system uses simulated API calls. To integrate with a real backend:

**Auth Endpoints**:
```javascript
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET  /api/auth/me
```

**Onboarding Endpoints**:
```javascript
PUT  /api/onboarding/relocation-type
PUT  /api/onboarding/personal-details
PUT  /api/onboarding/visa-check
PUT  /api/onboarding/payment
PUT  /api/onboarding/call-schedule
POST /api/onboarding/documents (multipart/form-data)
GET  /api/onboarding/status
```

**Update**: Replace localStorage calls in `OnboardingContext.js` with API calls.

---

### 2. Payment Gateway (Stripe/PayPal)

**Stripe Integration**:
```javascript
import { loadStripe } from '@stripe/stripe-js';

const handleStripePayment = async () => {
  const stripe = await loadStripe('your_publishable_key');

  // Create checkout session
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ amount: 9900, currency: 'usd' })
  });

  const session = await response.json();
  await stripe.redirectToCheckout({ sessionId: session.id });
};
```

**PayPal Integration**:
```javascript
import { PayPalButtons } from '@paypal/react-paypal-js';

<PayPalButtons
  createOrder={(data, actions) => {
    return actions.order.create({
      purchase_units: [{ amount: { value: '99.00' } }]
    });
  }}
  onApprove={(data, actions) => {
    return actions.order.capture().then(completePayment);
  }}
/>
```

---

### 3. Calendly Integration

Replace the custom date/time selector with Calendly:

```javascript
import { InlineWidget } from 'react-calendly';

<InlineWidget
  url="https://calendly.com/your-team/onboarding-call"
  styles={{ height: '700px' }}
  pageSettings={{
    backgroundColor: 'ffffff',
    hideEventTypeDetails: false,
    hideLandingPageDetails: false,
    primaryColor: '3B82F6',
    textColor: '1F2937'
  }}
  prefill={{
    name: onboardingData.personalDetails.fullName,
    email: onboardingData.personalDetails.email
  }}
/>
```

---

### 4. File Storage (Firebase/AWS S3)

**Firebase Storage**:
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadDocument = async (file, docType) => {
  const storage = getStorage();
  const storageRef = ref(storage, `documents/${user.id}/${docType}/${file.name}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return { url: downloadURL, name: file.name, type: file.type };
};
```

**AWS S3**:
```javascript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const uploadToS3 = async (file) => {
  const params = {
    Bucket: 'your-bucket-name',
    Key: `documents/${user.id}/${file.name}`,
    Body: file,
    ContentType: file.type
  };

  return s3.upload(params).promise();
};
```

---

## Testing Guide

### Manual Testing Checklist

#### Europe Flow (Full Journey)

- [ ] Sign up new user
- [ ] Redirected to onboarding
- [ ] Select "Europe" relocation
- [ ] Fill personal details form
  - [ ] Test country dropdown
  - [ ] Test state auto-population
  - [ ] Test city auto-population
  - [ ] Test form validation
- [ ] Answer all 9 visa questions
  - [ ] Test back/next navigation
  - [ ] Test question progress indicator
- [ ] View eligibility result
  - [ ] Test with eligible answers
  - [ ] Test with ineligible answers
- [ ] Complete payment
  - [ ] Test Stripe button
  - [ ] Test PayPal button
- [ ] Schedule call
  - [ ] Test date picker
  - [ ] Test time dropdown
  - [ ] Test validation
- [ ] Upload documents
  - [ ] Test passport upload (required)
  - [ ] Test optional documents
  - [ ] Test file validation
- [ ] Verify redirect to dashboard
- [ ] Verify dashboard access
- [ ] Log out and log back in
- [ ] Verify dashboard still accessible

#### GCC Flow (Shortened Journey)

- [ ] Sign up new user
- [ ] Select "GCC" relocation
- [ ] Fill personal details
- [ ] Verify visa check is skipped
- [ ] Complete payment
- [ ] Schedule call
- [ ] Upload documents
- [ ] Access dashboard

#### Access Control Tests

- [ ] Try accessing dashboard without completing onboarding
  - [ ] Should redirect to onboarding
- [ ] Complete onboarding partially
  - [ ] Dashboard should remain blocked
- [ ] Complete all steps
  - [ ] Dashboard should unlock
- [ ] Admin login
  - [ ] Should bypass onboarding checks

---

## Future Enhancements

### Phase 2 Features

1. **Email Notifications**
   - Welcome email after signup
   - Payment confirmation
   - Call reminder (24 hours before)
   - Document receipt confirmation

2. **SMS Notifications**
   - Call reminders
   - Important updates

3. **Multi-Language Support**
   - English, German, Arabic
   - Dynamic language switcher

4. **Progress Saving**
   - Auto-save on field change
   - "Save and continue later" option
   - Email resume link

5. **Advanced Visa Calculators**
   - Different visa types (work permit, student, family)
   - Multiple countries (UK, Canada, Australia, etc.)
   - Probability scoring

6. **Document AI Processing**
   - Automatic passport data extraction (OCR)
   - Document validity checking
   - Translation services

7. **Video Call Integration**
   - Zoom/Google Meet embed
   - In-app video calls

8. **Dashboard Analytics**
   - Application status tracker
   - Timeline visualization
   - Checklist progress

9. **Referral Program**
   - Share invite links
   - Track referrals
   - Rewards system

10. **Admin Panel Enhancements**
    - View all user applications
    - Approve/reject visa assessments
    - Manage call schedules
    - Document review interface

---

## API Reference (For Backend Team)

### User Model

```javascript
{
  id: string,
  email: string,
  name: string,
  role: 'customer' | 'admin',
  onboardingComplete: boolean,
  onboardingData: {
    relocationType: 'europe' | 'gcc',
    personalDetails: {
      fullName: string,
      email: string,
      telephone: string,
      address: {
        street: string,
        city: string,
        state: string,
        zip: string,
        country: string
      }
    },
    visaCheck: {...},
    visaEligibilityResult: 'eligible' | 'not_eligible' | null,
    paymentCompleted: boolean,
    paymentDetails: {...},
    onboardingCallScheduled: boolean,
    callScheduleDetails: {...},
    documentsUploaded: boolean,
    documents: {
      passport: { url, name, uploadedAt },
      educationalCertificates: [],
      experienceLetters: [],
      jobOffer: { url, name, uploadedAt }
    },
    completedSteps: number[],
    createdAt: timestamp,
    lastUpdated: timestamp
  }
}
```

---

## Support & Troubleshooting

### Common Issues

**Issue**: User stuck on onboarding after payment
- **Solution**: Check `onboardingData.paymentCompleted` in localStorage
- **Fix**: Manually set to `true` or reset onboarding

**Issue**: Dashboard redirect loop
- **Solution**: Verify `canAccessDashboard()` logic
- **Fix**: Check all required steps are marked complete

**Issue**: Visa check questions not saving
- **Solution**: Check `updateVisaCheck()` is called on each question
- **Fix**: Ensure localStorage has write permissions

---

## Contact

For technical questions or feature requests, please contact:
- **Development Team**: dev@falconglobalconsulting.com
- **Project Manager**: pm@falconglobalconsulting.com

---

## Change Log

### Version 1.0.0 (Current)
- ✅ Multi-step onboarding flow
- ✅ Europe/GCC routing logic
- ✅ Visa eligibility calculator
- ✅ Payment integration (simulated)
- ✅ Call scheduling
- ✅ Document upload
- ✅ Dashboard access control
- ✅ State persistence (localStorage)

### Planned for Version 1.1.0
- Real backend API integration
- Stripe/PayPal live payments
- Firebase Storage for documents
- Calendly integration
- Email notifications

---

**Last Updated**: 2025-01-23
**Documentation Version**: 1.0.0
**System Status**: ✅ Production Ready (with simulated integrations)
