# Lead Application Form & GoHighLevel Integration

## 📋 Overview

A professional multi-step lead qualification form integrated with **GoHighLevel (GHL)** CRM for automatic contact creation.

---

## 🎯 Form Location

**URL**: `https://yourdomain.com/apply`

**Purpose**: Qualify leads with targeted questions before onboarding

---

## ❓ Qualifying Questions (11 Total)

1. ✅ **First Name** - Text input
2. ✅ **Last Name** - Text input
3. ✅ **Phone Number** - Tel input with validation
4. ✅ **Email Address** - Email input with validation
5. ✅ **Current Country** - Text input
6. ✅ **Current Job Title** - Text input
7. ✅ **Willing to Invest** - Radio buttons (Yes/No/Maybe)
8. ✅ **Target Countries** - Textarea
9. ✅ **Role Type** - Text input
10. ✅ **Relocation Type** - Radio buttons (Alone/Family/Undecided)
11. ✅ **Timeline** - Select dropdown (1-3 months, 3-6 months, etc.)

---

## ✨ Features

### **User Experience**

- ✅ **One Question at a Time** - Focused, conversational flow
- ✅ **Progress Bar** - Shows completion percentage
- ✅ **Real-time Validation** - Instant feedback on errors
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Keyboard Navigation** - Press Enter to continue
- ✅ **Professional Design** - Modern, clean interface

### **Technical Features**

- ✅ **Auto-saves Progress** - No data loss
- ✅ **Field Validation** - Email, phone number checks
- ✅ **Error Handling** - Clear error messages
- ✅ **Loading States** - Visual feedback during submission
- ✅ **Success Redirect** - Automatic redirect to thank you page

---

## 🔗 GoHighLevel Integration

### **API Endpoint**

```
POST /api/ghl/create-contact
```

### **What Gets Sent to GHL**

```javascript
{
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  source: "Lead Application Form",
  customFields: [
    { key: "current_country", field_value: "United States" },
    { key: "job_title", field_value: "Software Engineer" },
    { key: "willing_to_invest", field_value: "yes" },
    { key: "target_countries", field_value: "Germany, UAE" },
    { key: "role_type", field_value: "Full-time" },
    { key: "relocation_type", field_value: "with_family" },
    { key: "timeline", field_value: "3-6_months" }
  ],
  tags: [
    "Lead Form",
    "Website Application",
    "Ready to Invest"  // or "Needs Nurturing"
  ]
}
```

### **GHL API Configuration**

- **API URL**: `https://services.leadconnectorhq.com/contacts/`
- **API Key**: `pit-7db6969b-6100-4f52-853e-f51bf76356c2`
- **Version**: `2021-07-28`
- **Documentation**: [GHL Create Contact API](https://marketplace.gohighlevel.com/docs/ghl/contacts/create-contact/)

---

## 🚀 Setup Instructions

### **1. Configure Environment Variables**

Add to your `.env.local`:

```bash
# GoHighLevel API Key
GHL_API_KEY=pit-7db6969b-6100-4f52-853e-f51bf76356c2
```

### **2. Deploy Files**

Files created:
- ✅ `/pages/apply.js` - Lead form page
- ✅ `/pages/thank-you.js` - Success page
- ✅ `/pages/api/ghl/create-contact.js` - GHL integration

### **3. Test the Form**

```bash
# Start development server
npm run dev

# Navigate to
http://localhost:3000/apply

# Fill out the form
# Check GHL dashboard for new contact
```

---

## 📊 Custom Fields in GHL

You may need to create these custom fields in your GHL account:

| Field Key | Field Name | Type |
|-----------|-----------|------|
| `current_country` | Current Country | Text |
| `job_title` | Job Title | Text |
| `willing_to_invest` | Willing to Invest | Dropdown/Text |
| `target_countries` | Target Countries | Text Area |
| `role_type` | Role Type | Text |
| `relocation_type` | Relocation Type | Dropdown |
| `timeline` | Timeline | Dropdown |

### **How to Create Custom Fields in GHL:**

1. Go to GHL Dashboard
2. Navigate to **Settings** → **Custom Fields**
3. Click **Add Custom Field**
4. Set field key exactly as shown above
5. Save field

---

## 🎨 Form Flow

```
User visits /apply
    ↓
Question 1/11: First Name
    ↓
Question 2/11: Last Name
    ↓
... (continues through all 11 questions)
    ↓
Question 11/11: Timeline
    ↓
Submit button → API call to /api/ghl/create-contact
    ↓
GHL creates contact with all data
    ↓
Redirect to /thank-you
    ↓
Success message displayed
```

---

## 📧 What Happens After Submission

### **Immediate**

1. ✅ Contact created in GoHighLevel
2. ✅ User redirected to thank you page
3. ✅ Tags applied based on responses

### **Within 24-48 Hours**

1. 📞 Your team reviews the lead in GHL
2. 📧 Automated email sequence (configure in GHL)
3. 📱 Follow-up call scheduled

---

## 🔍 Testing Checklist

- [ ] Form loads at `/apply`
- [ ] All 11 questions display correctly
- [ ] Validation works (email, phone)
- [ ] Progress bar updates
- [ ] Submit button shows loading state
- [ ] Contact created in GHL dashboard
- [ ] Custom fields populated correctly
- [ ] Tags applied properly
- [ ] Redirect to `/thank-you` works
- [ ] Thank you page displays

---

## 🐛 Troubleshooting

### **Issue: Contact not created in GHL**

**Check:**
1. GHL API key is correct in `.env.local`
2. GHL account is active
3. Custom fields exist in GHL
4. Check server logs for API errors

**Fix:**
```bash
# Check API logs
# Look for errors in terminal output
# Verify API key: echo $GHL_API_KEY
```

### **Issue: Custom fields not showing in GHL**

**Solution:**
- Create custom fields in GHL dashboard first
- Use exact field keys from documentation
- Refresh GHL dashboard

### **Issue: Form submission fails**

**Check:**
1. Network tab in browser dev tools
2. Server logs for errors
3. API endpoint responding: `/api/ghl/create-contact`

---

## 📋 Lead Qualification Logic

### **Auto-Tagging Based on Responses:**

```javascript
// If user answers "Yes" to willing to invest
Tags: ["Lead Form", "Website Application", "Ready to Invest"]

// If user answers "No" or "Maybe"
Tags: ["Lead Form", "Website Application", "Needs Nurturing"]
```

### **Lead Scoring (Recommended in GHL):**

| Answer | Points |
|--------|--------|
| Willing to Invest: Yes | +20 |
| Timeline: 1-3 months | +15 |
| Timeline: 3-6 months | +10 |
| Has job title | +5 |
| Relocating with family | +10 |

**Total Possible**: 60 points

---

## 🎯 Next Steps

### **Enhance Lead Form (Optional):**

1. Add more qualifying questions
2. Implement conditional logic (skip questions based on answers)
3. Add file upload for CV/Resume
4. Multi-language support
5. Save progress to database

### **GHL Automation (Configure in GHL):**

1. **Email Sequence**: Automatic follow-up emails
2. **SMS Notifications**: Instant SMS to team when lead submits
3. **Workflow Triggers**: Auto-assign to sales rep
4. **Lead Scoring**: Automatic scoring based on answers
5. **Calendar Booking**: Direct link to book consultation

---

## 📞 Support

### **GHL Support:**
- Documentation: [https://marketplace.gohighlevel.com/docs](https://marketplace.gohighlevel.com/docs)
- Support: Contact your GHL account manager

### **Form Customization:**
- Edit: `/pages/apply.js`
- Add questions: Modify `questions` array
- Change styling: Update Tailwind classes

---

## 🎉 Summary

You now have:

✅ **Professional lead form** at `/apply`
✅ **11 qualifying questions** in conversational flow
✅ **GoHighLevel integration** for automatic contact creation
✅ **Custom fields mapping** for all data points
✅ **Auto-tagging** based on responses
✅ **Thank you page** with next steps
✅ **Mobile-responsive** design
✅ **Validation & error handling**

**Ready to capture leads!** 🚀

---

**Form URL**: `https://yourdomain.com/apply`
**Status**: ✅ Ready to Use
**Last Updated**: December 4, 2025
