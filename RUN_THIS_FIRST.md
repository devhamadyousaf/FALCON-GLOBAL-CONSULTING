# 🚨 RUN THIS FIRST - Add Missing Database Columns

## Problem

You're getting this error:
```
Could not find the 'order_number' column of 'payments' in the schema cache
```

## Solution

You need to add 3 missing columns to your `payments` table.

---

## 📝 Steps to Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (kojoegkrhrgvzqztkjwj)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy & Run SQL

Copy the entire contents of **[ADD_TILOPAY_COLUMNS.sql](ADD_TILOPAY_COLUMNS.sql)** and paste it into the SQL editor.

Or copy this:

```sql
-- Add order_number column (unique)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Add tilopay_reference column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS tilopay_reference TEXT;

-- Add plan column
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS plan TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_number
  ON payments(order_number);

CREATE INDEX IF NOT EXISTS idx_payments_tilopay_reference
  ON payments(tilopay_reference);

CREATE INDEX IF NOT EXISTS idx_payments_plan
  ON payments(plan);

-- Update status constraint to include 'abandoned'
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments ADD CONSTRAINT payments_status_check
  CHECK (status = ANY(ARRAY[
    'pending'::text,
    'completed'::text,
    'failed'::text,
    'refunded'::text,
    'abandoned'::text
  ]));
```

### Step 3: Click "Run"

Click the **"Run"** button (or press `Ctrl+Enter`)

### Step 4: Verify

You should see a success message and output showing the 3 new columns:
```
column_name         | data_type | is_nullable
--------------------+-----------+-------------
order_number        | text      | YES
plan                | text      | YES
tilopay_reference   | text      | YES
```

### Step 5: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

---

## ✅ What This Adds

### New Columns

1. **`order_number`** - Unique order tracking number (e.g., "FGC-1706123456-abc123")
2. **`tilopay_reference`** - Tilopay's reference number from their gateway
3. **`plan`** - Plan name (silver, gold, diamond)

### Updated Constraint

- Added `'abandoned'` to the allowed status values

### New Indexes

- Faster queries on `order_number`, `tilopay_reference`, and `plan`

---

## 🧪 Test After Migration

1. Go to: `http://localhost:3000/onboarding-new?step=3`
2. Click **"Select Plan"** on any package
3. Payment page should load without errors
4. You should see the payment form with Tilopay fields

---

## 🆘 If You Get Errors

### "permission denied"

**Solution:** Make sure you're logged in to Supabase with admin access

### "relation already exists"

**Solution:** The columns already exist, you're good! Skip to Step 5 (restart server)

### "column already exists"

**Solution:** Same as above, already done! Just restart your server.

---

## 📊 Verify in Database

After running the SQL, you can verify by running:

```sql
SELECT * FROM payments LIMIT 1;
```

You should see columns: `order_number`, `tilopay_reference`, and `plan`

---

## 🎯 What Happens Next

After adding these columns:

1. ✅ Payment initiation will work
2. ✅ Order numbers will be generated
3. ✅ Tilopay callbacks will update correctly
4. ✅ Payment records will be complete

---

**Time to complete:** ~2 minutes
**Status:** Required before payment will work
