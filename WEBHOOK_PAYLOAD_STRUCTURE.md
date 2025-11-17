# Webhook Payload Structure

## Endpoint
```
POST https://etgstkql.rcld.app/webhook/0da32b08-c8b9-492e-9805-628d6a23d972
```

## Updated Payload Format

The webhook now receives **actual file data** instead of just file IDs.

### JSON Structure

```json
{
  "job_ids": [1, 2, 3, 4, 5],
  "user_email": "user@example.com",
  "gmail_account_id": 123,
  "access_token": "ya29.a0AfB_...",
  "refresh_token": "1//0gxxx...",
  "cv": {
    "name": "resume.pdf",
    "data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC...", // Base64 encoded file
    "mimeType": "application/pdf",
    "size": 245760  // Size in bytes
  },
  "cover_letter": {
    "name": "cover_letter.pdf",
    "data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC...", // Base64 encoded file
    "mimeType": "application/pdf",
    "size": 102400  // Size in bytes
  },
  "timestamp": "2025-11-13T12:34:56.789Z"
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `job_ids` | Array<number> | List of job IDs to apply to |
| `user_email` | string | User's email address |
| `gmail_account_id` | number | Database ID of the Gmail account |
| `access_token` | string | Google OAuth access token for Gmail API |
| `refresh_token` | string | Google OAuth refresh token |
| `cv` | object \| null | CV file object (null if not provided) |
| `cover_letter` | object \| null | Cover letter file object (null if not provided) |
| `timestamp` | string | ISO 8601 timestamp of the request |

## File Object Structure

Each file object (`cv` and `cover_letter`) contains:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Original filename (e.g., "resume.pdf") |
| `data` | string | Base64-encoded file content |
| `mimeType` | string | MIME type (typically "application/pdf") |
| `size` | number | File size in bytes (original, not base64) |

## Processing Files on Webhook Side

### Decoding Base64 Files

**Node.js Example:**
```javascript
// Decode base64 to buffer
const cvBuffer = Buffer.from(payload.cv.data, 'base64');

// Save to file
const fs = require('fs');
fs.writeFileSync('resume.pdf', cvBuffer);

// Or use directly with Gmail API
const attachment = {
  filename: payload.cv.name,
  content: cvBuffer,
  contentType: payload.cv.mimeType
};
```

**Python Example:**
```python
import base64

# Decode base64 to bytes
cv_bytes = base64.b64decode(payload['cv']['data'])

# Save to file
with open('resume.pdf', 'wb') as f:
    f.write(cv_bytes)
```

### Using with Gmail API

The files can be directly attached to emails using the Gmail API:

```javascript
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Create email with attachments
const email = {
  to: 'company@example.com',
  subject: 'Job Application',
  text: 'Please find my application attached.',
  attachments: [
    {
      filename: payload.cv.name,
      content: Buffer.from(payload.cv.data, 'base64'),
      contentType: payload.cv.mimeType
    },
    {
      filename: payload.cover_letter.name,
      content: Buffer.from(payload.cover_letter.data, 'base64'),
      contentType: payload.cover_letter.mimeType
    }
  ]
};
```

## File Size Considerations

- **Base64 encoding increases file size by ~33%**
- Example: 1 MB file → 1.33 MB base64
- Typical CV/Cover Letter: 100-500 KB each
- After base64: 133-665 KB each
- Total payload size: Usually < 2 MB

## Error Handling

### Missing Files
If CV or cover letter is not selected, the field will be `null`:

```json
{
  "cv": null,
  "cover_letter": {
    "name": "cover.pdf",
    "data": "...",
    ...
  }
}
```

### Failed File Fetch
If file cannot be fetched from storage, the API will return a 500 error:

```json
{
  "error": "Failed to fetch CV file",
  "details": "Object not found"
}
```

## Testing

### Sample cURL Command

```bash
curl -X POST https://etgstkql.rcld.app/webhook/0da32b08-c8b9-492e-9805-628d6a23d972 \
  -H "Content-Type: application/json" \
  -d '{
    "job_ids": [1, 2],
    "user_email": "test@example.com",
    "gmail_account_id": 1,
    "access_token": "ya29.test",
    "refresh_token": "1//test",
    "cv": {
      "name": "test.pdf",
      "data": "JVBERi0xLjQKJeLjz9MK...",
      "mimeType": "application/pdf",
      "size": 1024
    },
    "cover_letter": null,
    "timestamp": "2025-11-13T12:00:00.000Z"
  }'
```

## Changes from Previous Version

### Before (File IDs Only)
```json
{
  "cv_id": "uuid-1234",
  "cover_letter_id": "uuid-5678"
}
```

### After (Full File Data)
```json
{
  "cv": {
    "name": "resume.pdf",
    "data": "base64...",
    "mimeType": "application/pdf",
    "size": 245760
  },
  "cover_letter": {
    "name": "cover.pdf",
    "data": "base64...",
    "mimeType": "application/pdf",
    "size": 102400
  }
}
```

## Benefits

✅ **No additional API calls needed** - Files are included in the webhook payload
✅ **Direct attachment** - Can be used immediately with email APIs
✅ **Self-contained** - All data needed for job applications in one request
✅ **Reliable** - No dependency on external storage access from webhook
