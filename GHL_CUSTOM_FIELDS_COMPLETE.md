# 🎯 GoHighLevel Custom Fields - Complete Setup Guide

## 📋 Overview

All 13 questions from the `/apply` form are now saved as **custom fields** in GoHighLevel. This gives you maximum flexibility for:
- Advanced filtering and segmentation
- Custom workflows and automations
- Detailed reporting and analytics
- Data export and analysis

---

## 📊 All 13 Custom Fields to Create in GHL

You need to create **13 custom fields** in your GoHighLevel account. Here's the complete list:

| # | Field Key | Field Name | Type | Description |
|---|-----------|------------|------|-------------|
| 1 | `first_name` | First Name | Text | Lead's first name |
| 2 | `last_name` | Last Name | Text | Lead's last name |
| 3 | `phone_number` | Phone Number | Phone | Lead's phone with country code |
| 4 | `email_address` | Email Address | Email | Lead's email address |
| 5 | `current_country` | Current Country | Text | Country they currently live in |
| 6 | `job_title` | Job Title | Text | Current job title/position |
| 7 | `years_of_experience` | Years of Experience | Dropdown | Work experience level |
| 8 | `willing_to_invest` | Financial Investment | Dropdown | Financial readiness for relocation |
| 9 | `target_countries` | Target Countries | Text Area | Countries interested in |
| 10 | `english_level` | English Level | Dropdown | English proficiency (1-10) |
| 11 | `role_type` | Role Type | Text | Type of role seeking |
| 12 | `relocation_type` | Relocation Type | Dropdown | Alone or with family |
| 13 | `timeline` | Timeline | Dropdown | Expected relocation timeline |

---

## 🔧 How to Create Custom Fields in GoHighLevel

### **Step-by-Step Instructions:**

1. **Log in to GoHighLevel**
   - Go to your GHL dashboard

2. **Navigate to Custom Fields**
   - Click on **Settings** (gear icon)
   - Select **Custom Fields**
   - Click **"Add Custom Field"**

3. **Create Each Field Using the Details Below**

---

## 📝 Detailed Field Configurations

### **1. First Name**
```
Field Key: first_name
Field Name: First Name
Field Type: Text
Placeholder: John
Required: Yes
Description: Lead's first name from application form
```

### **2. Last Name**
```
Field Key: last_name
Field Name: Last Name
Field Type: Text
Placeholder: Doe
Required: Yes
Description: Lead's last name from application form
```

### **3. Phone Number**
```
Field Key: phone_number
Field Name: Phone Number
Field Type: Phone (or Text)
Placeholder: +1 234 567 8900
Required: Yes
Description: Lead's phone number with country code (international format)
Note: Contains country code selected by user
```

### **4. Email Address**
```
Field Key: email_address
Field Name: Email Address
Field Type: Email (or Text)
Placeholder: john.doe@example.com
Required: Yes
Description: Lead's email address from application form
```

### **5. Current Country**
```
Field Key: current_country
Field Name: Current Country
Field Type: Text
Placeholder: United States
Required: Yes
Description: Country where the lead currently resides
```

### **6. Job Title**
```
Field Key: job_title
Field Name: Job Title
Field Type: Text
Placeholder: Software Engineer
Required: Yes
Description: Lead's current job title or position
```

### **7. Years of Experience**
```
Field Key: years_of_experience
Field Name: Years of Experience
Field Type: Dropdown
Required: Yes
Options:
  - 0-1
  - 1-3
  - 3-5
  - 5-10
  - 10+
Description: Lead's total years of work experience
```

### **8. Financial Investment (Willing to Invest)**
```
Field Key: willing_to_invest
Field Name: Financial Investment Readiness
Field Type: Dropdown
Required: Yes

  - Yes, I am aware and financially ready
  - No, I am not in a position to invest
  - Maybe, I need more information about costs
Description: Lead's awareness and readiness for financial investment in relocation
Tags: Use this to tag leads as "Ready to Invest" or "Needs Nurturing"
```

### **9. Target Countries**
```
Field Key: target_countries
Field Name: Target Countries
Field Type: Text Area (or Text)
Placeholder: Germany, UAE, Canada
Required: Yes
Description: Countries or regions the lead is considering for relocation
Note: Can contain multiple countries separated by commas
```

### **10. English Level**
```
Field Key: english_level
Field Name: English Level
Field Type: Dropdown
Required: Yes
Display Labels:
  - 1 - No English skills
  - 2 - Very basic
  - 3 - Basic
  - 4 - Elementary
  - 5 - Intermediate
  - 6 - Upper intermediate
  - 7 - Advanced
  - 8 - Very advanced
  - 9 - Near native
  - 10 - Native English speaker
Description: Lead's self-assessed English proficiency level
```

### **11. Role Type**
```
Field Key: role_type
Field Name: Role Type
Field Type: Text
Placeholder: Full-time, Part-time, Contract
Required: Yes
Description: Type of role the lead is seeking (employment type)
```

### **12. Relocation Type**
```
Field Key: relocation_type
Field Name: Relocation Type
Field Type: Dropdown
Required: Yes
Display Labels:
  - By myself
  - With my family
  - Not sure yet
Description: Whether lead plans to relocate alone or with family
```

### **13. Timeline**
```
Field Key: timeline
Field Name: Expected Timeline
Field Type: Dropdown
Required: Yes

Display Labels:
  - 1-3 months
  - 3-6 months
  - 6-12 months
  - 12+ months
  - Flexible / Not sure
Description: Lead's expected timeline for completing relocation
```

---

## 🎯 Why All Fields Are Custom Fields

### **Standard GHL Fields vs Custom Fields:**

**Standard Contact Fields:**
- `firstName`, `lastName`, `email`, `phone` → Built into GHL

**Our Approach:**
- We save these in BOTH standard fields AND custom fields
- **Standard fields**: For basic contact information
- **Custom fields**: For advanced filtering, workflows, and exports

### **Benefits of This Approach:**

1. ✅ **Better Data Organization**
   - All 13 form answers in one place (custom fields section)
   - Easy to view all application data together

2. ✅ **Advanced Filtering**
   - Filter contacts by any question/answer
   - Example: Show all leads with 5-10 years experience AND English level 7+

3. ✅ **Custom Workflows**
   - Trigger automations based on any field
   - Example: If `willing_to_invest = yes` → Send to sales team immediately

4. ✅ **Better Reporting**
   - Export all custom fields to CSV/Excel
   - Analyze trends (most common countries, experience levels, etc.)

5. ✅ **Consistency**
   - All 13 questions visible in same format
   - Easier for your team to review applications

---

## 📊 Smart Tags Based on Responses

The API automatically assigns tags based on answers:

### **Automatic Tags:**
```javascript
Tags Applied to Every Lead:
  - "Lead Form"
  - "Website Application"

Conditional Tags (based on willing_to_invest):
  - If yes → "Ready to Invest"
  - If no/maybe → "Needs Nurturing"
```

### **Suggested Additional Tags to Create:**

You can create workflows in GHL to add more tags:

**Experience Level Tags:**
- `Entry Level` (0-3 years)
- `Mid Level` (3-10 years)
- `Senior Level` (10+ years)

**English Proficiency Tags:**
- `English: Beginner` (1-3)
- `English: Intermediate` (4-6)
- `English: Advanced` (7-10)

**Timeline Tags:**
- `Urgent` (1-3 months)
- `Standard` (3-6 months)
- `Long Term` (6+ months)

**Family Status Tags:**
- `Solo Relocation`
- `Family Relocation`

---

## 🔄 Data Flow Diagram

```
User Fills Out /apply Form (13 Questions)
           ↓
Submits Application
           ↓
API: pages/api/ghl/create-contact.js
           ↓
Creates Contact in GoHighLevel:
           ↓
     ┌─────────────────────────────┐
     │  Standard Contact Fields    │
     │  - firstName: John          │
     │  - lastName: Doe            │
     │  - email: john@example.com  │
     │  - phone: +1234567890       │
     │  - locationId: Your_Loc_ID  │
     │  - source: Lead App Form    │
     └─────────────────────────────┘
           ↓
     ┌─────────────────────────────┐
     │  Custom Fields (All 13)     │
     │  1. first_name              │
     │  2. last_name               │
     │  3. phone_number            │
     │  4. email_address           │
     │  5. current_country         │
     │  6. job_title               │
     │  7. years_of_experience     │
     │  8. willing_to_invest       │
     │  9. target_countries        │
     │  10. english_level          │
     │  11. role_type              │
     │  12. relocation_type        │
     │  13. timeline               │
     └─────────────────────────────┘
           ↓
     ┌─────────────────────────────┐
     │  Tags                       │
     │  - Lead Form                │
     │  - Website Application      │
     │  - Ready to Invest (or)     │
     │  - Needs Nurturing          │
     └─────────────────────────────┘
```

---

## 🎨 GHL Dashboard View

### **What You'll See in GoHighLevel:**

When you open a contact created from the application form:

```
┌─────────────────────────────────────────┐
│ Contact: John Doe                       │
├─────────────────────────────────────────┤
│ Email: john.doe@example.com             │
│ Phone: +1 234 567 8900                  │
│ Location: CPdDgNhmmsS8CExkS9YD          │
│ Source: Lead Application Form           │
│ Tags: Lead Form, Website Application,   │
│       Ready to Invest                   │
├─────────────────────────────────────────┤
│ CUSTOM FIELDS                           │
├─────────────────────────────────────────┤
│ First Name: John                        │
│ Last Name: Doe                          │
│ Phone Number: +1 234 567 8900          │
│ Email Address: john.doe@example.com    │
│ Current Country: United States          │
│ Job Title: Software Engineer            │
│ Years of Experience: 5-10               │
│ Financial Investment: yes               │
│ Target Countries: Germany, UAE, Canada  │
│ English Level: 8                        │
│ Role Type: Full-time                    │
│ Relocation Type: with_family            │
│ Timeline: 6-12_months                   │
└─────────────────────────────────────────┘
```

---

## 🚀 Quick Setup Checklist

Use this checklist to set up all custom fields:

- [ ] **1. Log into GoHighLevel**
- [ ] **2. Navigate to Settings → Custom Fields**
- [ ] **3. Create Field: first_name (Text)**
- [ ] **4. Create Field: last_name (Text)**
- [ ] **5. Create Field: phone_number (Phone/Text)**
- [ ] **6. Create Field: email_address (Email/Text)**
- [ ] **7. Create Field: current_country (Text)**
- [ ] **8. Create Field: job_title (Text)**
- [ ] **9. Create Field: years_of_experience (Dropdown: 0-1, 1-3, 3-5, 5-10, 10+)**
- [ ] **10. Create Field: willing_to_invest (Dropdown: yes, no, maybe)**
- [ ] **11. Create Field: target_countries (Text Area)**
- [ ] **12. Create Field: english_level (Dropdown: 1-10)**
- [ ] **13. Create Field: role_type (Text)**
- [ ] **14. Create Field: relocation_type (Dropdown: alone, with_family, undecided)**
- [ ] **15. Create Field: timeline (Dropdown: 1-3_months, 3-6_months, 6-12_months, 12+_months, flexible)**
- [ ] **16. Test: Submit a test application form**
- [ ] **17. Verify: Check GHL contact has all 13 custom fields populated**

---

## 📈 Advanced Use Cases

### **1. Segmentation Examples:**

**High-Value Leads:**
- `willing_to_invest = yes`
- `years_of_experience = 5-10 OR 10+`
- `english_level >= 7`
- `timeline = 1-3_months OR 3-6_months`

**Nurturing Needed:**
- `willing_to_invest = maybe`
- `english_level < 5`
- Tag: "Needs Nurturing"

**Family Package Upsell:**
- `relocation_type = with_family`
- Can offer family relocation packages

### **2. Automation Examples:**

**Workflow 1: Immediate Follow-up**
```
Trigger: willing_to_invest = yes
Action:
  - Add tag "Hot Lead"
  - Send immediate email
  - Notify sales team
  - Schedule consultation within 24 hours
```

**Workflow 2: Language Training Offer**
```
Trigger: english_level <= 4
Action:
  - Add tag "Needs English Training"
  - Send email about language courses
  - Offer English improvement package
```

**Workflow 3: Country-Specific Info**
```
Trigger: target_countries contains "Germany"
Action:
  - Send Germany relocation guide
  - Add tag "Germany Interested"
  - Assign to Germany specialist
```

**Workflow 4: Timeline-Based Nurturing**
```
Trigger: timeline = 12+_months OR flexible
Action:
  - Add to long-term nurture sequence
  - Send monthly newsletter
  - Tag "Long Term Prospect"
```

---

## 🎯 Custom Field Keys Reference

**Quick Copy-Paste List:**

```
first_name
last_name
phone_number
email_address
current_country
job_title
years_of_experience
willing_to_invest
target_countries
english_level
role_type
relocation_type
timeline
```

---

## ✅ Summary

### **What Changed:**
- ✅ All 13 form questions now saved as custom fields
- ✅ First name, last name, email, phone saved BOTH as standard fields AND custom fields
- ✅ Better data organization and tracking
- ✅ More flexible filtering and automation

### **What You Need to Do:**
1. Create 13 custom fields in GoHighLevel (see checklist above)
2. Use the exact field keys listed in this document
3. Test the form to ensure data flows correctly
4. Set up automations and workflows based on these fields

### **Benefits:**
- 📊 Complete data capture for all 13 questions
- 🎯 Advanced segmentation and filtering
- 🤖 Powerful automation possibilities
- 📈 Better reporting and analytics
- 💼 Easier for team to review applications

---

**Status**: ✅ **Implementation Complete!**

**API Updated**: All 13 fields sent to GHL as custom fields
**Fields to Create**: 13 custom fields in GoHighLevel
**Data Structure**: Optimized for automation and reporting
**Next Step**: Create custom fields in GHL using the checklist above!
