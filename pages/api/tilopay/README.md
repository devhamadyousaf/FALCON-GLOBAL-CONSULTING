# Tilopay API Endpoints

This directory contains the API endpoints for Tilopay payment integration.

## Endpoints

### 1. POST /api/tilopay/initiate

Initiates a new payment transaction with Tilopay.

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 299,
  "planName": "silver",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "currency": "USD",
  "address": "123 Main St",
  "city": "San Jose",
  "state": "SJ",
  "country": "CR",
  "phone": "+506 1234-5678"
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentId": "payment-uuid",
  "orderNumber": "FGC-1706123456789-abcd1234",
  "tilopayConfig": {
    "token": "api-key",
    "currency": "USD",
    "amount": 299,
    "billToEmail": "user@example.com",
    "orderNumber": "FGC-1706123456789-abcd1234",
    "redirect": "https://yoursite.com/api/tilopay/callback",
    ...
  },
  "message": "Payment initiated successfully"
}
```

**Response (Error):**
```json
{
  "error": "Missing required fields: userId, amount, planName, email, firstName, lastName"
}
```

**Process:**
1. Validates required fields
2. Creates payment record in database with status "pending"
3. Generates unique order number
4. Prepares Tilopay SDK configuration
5. Returns configuration for client-side SDK initialization

---

### 2. POST/GET /api/tilopay/callback

Handles Tilopay payment callbacks and webhook notifications.

**Methods:**
- `POST` - Webhook notification from Tilopay
- `GET` - User redirect after payment

**Request Parameters (via body or query):**
```json
{
  "order": "12345",
  "orderNumber": "FGC-1706123456789-abcd1234",
  "transaction_code": "TLPY-123456",
  "transaction_id": "txn_123456",
  "amount": "299",
  "status": "approved",
  "message": "Payment approved",
  "returnData": "base64-encoded-data",
  "authCode": "AUTH123",
  "brand": "visa",
  "last4": "1111",
  "payment_method": "credit_card"
}
```

**Response (POST - Webhook):**
```json
{
  "success": true,
  "status": "completed",
  "message": "Payment processed"
}
```

**Response (GET - Redirect):**
```
HTTP 302 Redirect to:
- Success: /onboarding-new?step=5&payment=success
- Failed: /onboarding-new?step=4&payment=failed&message=...
```

**Process:**
1. Receives payment result from Tilopay
2. Decodes returnData (contains userId, paymentId, planName)
3. Determines payment status (approved/pending/failed)
4. Updates payment record in database
5. If approved, updates onboarding_data.payment_completed = true
6. Returns JSON for webhooks, redirects for user callbacks

**Payment Status Mapping:**
- `status = "approved"` or `status = 1` → "completed"
- `status = "pending"` or `status = 2` → "pending"
- All others → "failed"

---

### 3. POST /api/tilopay/verify

Verifies the current status of a payment transaction.

**Request:**
```json
{
  "paymentId": "payment-uuid",
  "userId": "user-uuid",
  "orderNumber": "FGC-1706123456789-abcd1234"
}
```

**Note:** Either `paymentId` or `orderNumber` is required.

**Response (Success):**
```json
{
  "success": true,
  "status": "completed",
  "paymentId": "payment-uuid",
  "amount": 299,
  "plan": "silver",
  "orderNumber": "FGC-1706123456789-abcd1234",
  "transactionId": "TLPY-123456",
  "tilopayReference": "12345",
  "createdAt": "2025-01-26T10:30:00.000Z",
  "updatedAt": "2025-01-26T10:35:00.000Z"
}
```

**Response (Error):**
```json
{
  "error": "Payment not found"
}
```

**Process:**
1. Queries payment record from database
2. Checks if payment is abandoned (pending for >10 minutes)
3. Returns current payment status
4. Auto-marks abandoned payments

**Automatic Status Updates:**
- Payments pending for >10 minutes are marked as "abandoned"

---

## Payment Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Call /api/tilopay/initiate
       ▼
┌─────────────────────────────┐
│  POST /api/tilopay/initiate │
│                             │
│  • Validate data            │
│  • Create payment record    │
│  • Generate order number    │
│  • Return Tilopay config    │
└──────┬──────────────────────┘
       │
       │ 2. Initialize Tilopay SDK
       ▼
┌─────────────┐
│   Tilopay   │
│     SDK     │◄─── 3. User enters card details
└──────┬──────┘
       │
       │ 4. Process payment
       ▼
┌─────────────────────────────┐
│       Tilopay Gateway       │
└──────┬──────────────────────┘
       │
       │ 5. POST callback/webhook
       ▼
┌─────────────────────────────┐
│  POST /api/tilopay/callback │
│                             │
│  • Decode returnData        │
│  • Update payment status    │
│  • Update onboarding_data   │
│  • Redirect user            │
└──────┬──────────────────────┘
       │
       │ 6. Redirect to success/failure page
       ▼
┌─────────────┐
│   Client    │
│  (Success)  │
└─────────────┘
```

---

## Database Schema

### payments table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(10, 2),
  plan TEXT,
  payment_method TEXT DEFAULT 'tilopay',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'abandoned')),
  order_number TEXT UNIQUE,
  transaction_id TEXT,
  tilopay_reference TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security

### Authentication
- All endpoints validate user authentication
- Uses Supabase service role key for database operations
- Row-Level Security (RLS) enforced on payments table

### Data Protection
- Card details never stored in database
- PCI compliance through Tilopay SDK
- Sensitive data in gateway_response JSONB field only

### RLS Policies
- Users can only view/insert their own payments
- Only service role can update payment records
- Prevents unauthorized access to payment data

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Invalid request body | Include all required fields |
| "Payment system not configured" | Missing env variables | Set TILOPAY_API_KEY, etc. |
| "Payment not found" | Invalid payment ID | Verify payment ID is correct |
| "Method not allowed" | Wrong HTTP method | Use POST for all endpoints |
| "Failed to create payment record" | Database error | Check Supabase connection |

### Status Codes

- `200` - Success
- `400` - Bad request (missing fields)
- `401` - Unauthorized (not logged in)
- `404` - Payment not found
- `405` - Method not allowed
- `500` - Internal server error

---

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Tilopay API Credentials
TILOPAY_API_KEY=your-api-key
TILOPAY_API_USER=your-api-user
TILOPAY_API_PASSWORD=your-api-password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (for callbacks)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Testing

### Test with curl

**Initiate Payment:**
```bash
curl -X POST http://localhost:3000/api/tilopay/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 299,
    "planName": "silver",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "currency": "USD"
  }'
```

**Verify Payment:**
```bash
curl -X POST http://localhost:3000/api/tilopay/verify \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment-uuid",
    "userId": "user-uuid"
  }'
```

### Test Cards

- **Approved:** 4111 1111 1111 1111
- **Declined:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

---

## Logging

All endpoints include console logging:

- ✅ Success operations (green checkmark)
- ❌ Errors (red X)
- 📥 Incoming data
- 💾 Database operations
- 💳 Payment processing
- 🔍 Verification checks

Example logs:
```
💾 Saving to database - User: abc123, Step: 4
✅ Payment initiated: { orderId: 'FGC-123', amount: 299, plan: 'silver' }
📥 Tilopay callback received: { method: 'POST', data: {...} }
💳 Payment status: completed for order FGC-123
✅ Payment completed successfully for user: abc123
```

---

## Support

For issues or questions:
- Check [TILOPAY_SETUP.md](../../../TILOPAY_SETUP.md) for setup guide
- Review [examples/payment-integration-example.js](../../../examples/payment-integration-example.js) for usage
- Contact Tilopay support for gateway issues
