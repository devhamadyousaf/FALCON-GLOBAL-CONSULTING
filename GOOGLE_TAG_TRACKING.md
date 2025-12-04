# Google Tag Tracking Summary

## ✅ Active Tracking Across All Pages

Your Google Tag (ID: `AW-17720879879`) is now **fully functional** and tracking across your entire website!

---

## 📊 What's Being Tracked

### 1. **Automatic Page Views**
- **Location:** `pages/_app.js`
- **Tracks:** Every page navigation (initial load + client-side routing)
- **Console Log:** `📊 Google Tag - Page view tracked: /page-url`

### 2. **Landing Page (index.js)**

#### Hero Section CTAs:
- ✅ **"Talk to an Expert"** button → Opens Calendly
  - Event: `click` | Category: `cta` | Label: `hero_talk_to_expert`

- ✅ **"Watch Our Story"** button
  - Event: `click` | Category: `engagement` | Label: `hero_watch_story`

#### Contact Form:
- ✅ **Contact Form Submission**
  - Event: `submit` | Category: `contact` | Label: `contact_form`

### 3. **Customer Dashboard**

#### Additional Services (Check24 Affiliate Links):
- ✅ **All 8 affiliate link clicks tracked:**
  - Electricity
  - Green Energy
  - Gas (Heating)
  - Internet
  - Mobile Phone
  - Flights
  - Rental Cars
  - Bank

  - Event: `affiliate_click` | Category: `affiliate` | Label: `[Service Name]`

---

## 🎯 Available Helper Functions

You can use these functions anywhere in your codebase by importing:

```javascript
import * as gtag from '../lib/gtag';
```

### Functions Available:

#### 1. `gtag.pageview(url)`
Track custom page views (already automatic via _app.js)

#### 2. `gtag.event({ action, category, label, value })`
Track any custom event
```javascript
gtag.event({
  action: 'click',
  category: 'button',
  label: 'signup_button'
});
```

#### 3. `gtag.conversion(conversionId, conversionLabel, value)`
Track Google Ads conversions
```javascript
gtag.conversion('AW-17720879879', 'YOUR_CONVERSION_LABEL', 699);
```

#### 4. `gtag.trackSignup()`
Track user signup events
```javascript
gtag.trackSignup();
```

#### 5. `gtag.trackPurchase(planName, amount)`
Track payment completions
```javascript
gtag.trackPurchase('Gold Plan', 699);
```

#### 6. `gtag.trackOnboardingComplete()`
Track when users complete onboarding
```javascript
gtag.trackOnboardingComplete();
```

#### 7. `gtag.trackAffiliateClick(serviceName)`
Track affiliate link clicks (already implemented on dashboard)
```javascript
gtag.trackAffiliateClick('Electricity');
```

---

## 🧪 How to Test

1. Open your website in browser
2. Open Developer Console (F12)
3. Navigate between pages → See: `📊 Google Tag - Page view tracked: /page`
4. Click tracked buttons → See: `📊 Google Tag - Event tracked: [action]`
5. Check Google Analytics/Ads dashboard for real-time data

---

## 📍 Implementation Locations

| File | What's Tracked |
|------|----------------|
| `pages/_document.js` | Google Tag script loaded |
| `pages/_app.js` | Automatic page view tracking |
| `lib/gtag.js` | Helper functions library |
| `components/Hero.js` | CTA button clicks |
| `components/Contact.js` | Contact form submissions |
| `pages/dashboard/customer.js` | Affiliate link clicks |

---

## 🚀 Next Steps (Optional)

To track more events, add tracking to:
- Login/Signup buttons
- Service card clicks
- Pricing plan selections
- Download/View document actions
- Navigation menu clicks

Example:
```javascript
import * as gtag from '../lib/gtag';

<button onClick={() => {
  gtag.event({
    action: 'click',
    category: 'pricing',
    label: 'gold_plan'
  });
  // ... rest of your code
}}>
  Select Gold Plan
</button>
```

---

## ✅ Status: FULLY OPERATIONAL

Your Google Tag is now tracking **all pages** and **key user actions** across your entire website! 🎉
