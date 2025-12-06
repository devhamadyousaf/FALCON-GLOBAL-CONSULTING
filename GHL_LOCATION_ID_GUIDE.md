# How to Find Your GoHighLevel Location ID

## ❌ Error: "The token does not have access to this location"

This error means you need to add your **GHL Location ID** to the environment variables.

---

## 🔍 How to Find Your Location ID

### **Method 1: GHL Dashboard (Easiest)**

1. Log into your **GoHighLevel** account
2. Go to **Settings** (gear icon in top right)
3. Click **Business Profile** or **Company Info**
4. Look for **Location ID** - it's usually a long alphanumeric string
5. Copy the Location ID

### **Method 2: From URL**

1. Log into GoHighLevel
2. Look at your browser URL bar
3. The URL will look like: `https://app.gohighlevel.com/v2/location/YOUR_LOCATION_ID/...`
4. Copy the `YOUR_LOCATION_ID` part

### **Method 3: Via API**

If you have multiple locations, you can list them:

```bash
curl -X GET https://services.leadconnectorhq.com/locations/ \
  -H "Authorization: Bearer pit-7db6969b-6100-4f52-853e-f51bf76356c2" \
  -H "Version: 2021-07-28"
```

This will return all locations your API key has access to.

---

## ⚙️ Add to Environment Variables

Once you have your Location ID, add it to `.env.local`:

```bash
# GoHighLevel Configuration
GHL_API_KEY=pit-7db6969b-6100-4f52-853e-f51bf76356c2
GHL_LOCATION_ID=your_location_id_here  # ← Add this line
```

**Example:**
```bash
GHL_LOCATION_ID=abc123def456ghi789
```

---

## 🔄 Restart Your Server

After adding the Location ID:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

---

## ✅ Test Again

1. Go to `http://localhost:3000/apply`
2. Fill out the form
3. Submit
4. Check your GHL dashboard for the new contact

---

## 📋 What the Location ID Looks Like

The Location ID is typically:
- **Format**: Alphanumeric string (letters + numbers)
- **Length**: 20-30 characters
- **Example**: `ve9EPM428h8vShlRW1KT` or `abc123def456ghi789jkl`

---

## 🆘 Still Having Issues?

### **Check API Key Permissions:**

1. Go to GHL Dashboard
2. Navigate to **Settings** → **API Keys**
3. Find your API key: `pit-7db6969b-6100-4f52-853e-f51bf76356c2`
4. Verify it has these permissions:
   - ✅ **Contacts** - Read & Write
   - ✅ **Locations** - Read

### **Verify Location Access:**

Make sure the API key has access to the specific location you're trying to use.

### **Contact GHL Support:**

If you can't find your Location ID:
- Email: support@gohighlevel.com
- Chat: Available in GHL dashboard
- Docs: https://highlevel.stoplight.io/

---

## 🎯 Quick Checklist

- [ ] Found Location ID in GHL Dashboard
- [ ] Added `GHL_LOCATION_ID` to `.env.local`
- [ ] Restarted development server
- [ ] Tested form submission
- [ ] Contact appears in GHL dashboard

---

## 📝 Full Environment Setup

Your `.env.local` should have both:

```bash
# GoHighLevel Configuration
GHL_API_KEY=pit-7db6969b-6100-4f52-853e-f51bf76356c2
GHL_LOCATION_ID=your_actual_location_id_here
```

---

**Need Help?** Check the [LEAD_FORM_SETUP.md](./LEAD_FORM_SETUP.md) for more details.
