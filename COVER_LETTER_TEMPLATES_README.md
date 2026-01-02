# Cover Letter Templates Feature

## Overview
This feature allows users to create and manage cover letter templates with dynamic variables, which can be used when creating job application campaigns. Both text-based templates with variables and PDF uploads are supported.

## Features

### For Customers
1. **Create Text Templates** - Write custom cover letter templates with dynamic variables
2. **Upload PDF Templates** - Upload pre-made PDF cover letters
3. **Manage Templates** - View, edit, and delete templates
4. **Use in Campaigns** - Select templates when creating job application campaigns

### For Admins
1. **View All Templates** - See templates created by all users
2. **Edit Templates** - Update template content and names
3. **Activate/Deactivate** - Control which templates are active
4. **Monitor Usage** - Track template variables and types

## Dynamic Variables

Templates support the following dynamic variables that will be replaced when sending applications:

- `{{company_name}}` - Target company name
- `{{job_title}}` - Job position title
- `{{location}}` - Job location
- `{{user_name}}` - User's full name

## Database Schema

### Table: `cover_letter_templates`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- name (text) - Template name
- type (text) - 'pdf' or 'text'
- content (text) - Template content with variables (for text type)
- file_path (text) - Storage path (for PDF type)
- file_name (text)
- file_size (integer)
- mime_type (text)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### GET `/api/cover-letter-templates`
Fetch templates for a user or all templates (admin)
- Query params: `userId`, `isAdmin`
- Returns: Array of templates

### POST `/api/cover-letter-templates`
Create a new text template
- Body: `{ userId, name, type, content }`
- Returns: Created template

### GET `/api/cover-letter-templates/[id]`
Get a specific template
- Returns: Template object

### PUT `/api/cover-letter-templates/[id]`
Update a template
- Body: `{ name, content, isActive }`
- Returns: Updated template

### DELETE `/api/cover-letter-templates/[id]`
Delete a template (and associated PDF if exists)
- Returns: Success message

### POST `/api/cover-letter-templates/upload`
Upload a PDF template
- Body: `{ userId, name, fileData (base64), fileName, mimeType }`
- Returns: Created template with file info

## Components

### `CoverLetterTemplates.js`
Customer-facing component for managing templates
- Located: `/components/CoverLetterTemplates.js`
- Used in: Customer Dashboard
- Features: Create, view, edit, delete templates

### `AdminCoverLetterTemplates.js`
Admin component for viewing and managing all templates
- Located: `/components/AdminCoverLetterTemplates.js`
- Used in: Admin Dashboard
- Features: View all, edit, activate/deactivate, search, filter

## Usage

### For Customers

1. **Navigate to Dashboard** → "Cover Letter Templates" section
2. **Create a Text Template**:
   - Click "New Text Template"
   - Enter template name
   - Write content with variables (e.g., `Dear {{company_name}} hiring manager`)
   - Save
3. **Upload PDF**:
   - Click "Upload PDF"
   - Select PDF file (max 5MB)
   - Enter template name
   - Upload
4. **Use in Campaign**:
   - Go to Services → Jobs
   - Create new campaign
   - Select cover letter template from dropdown
   - Campaign will use this template for all applications

### For Admins

1. **Navigate to Admin Dashboard** → "Cover Letter Templates" tab
2. **View Templates**: See all user templates with stats
3. **Edit Template**: Click "Edit Content" on text templates
4. **Activate/Deactivate**: Control template availability
5. **Search/Filter**: Find specific templates by name or type

## Storage

PDF templates are stored in the existing Supabase Storage bucket: `cover-letters`
- Structure: `{user_id}/{filename}` (matches your existing setup)
- Uses your existing bucket and folder structure
- Automatic cleanup on template deletion
- Public access with existing RLS policies

**Migrating Existing PDFs:**
If you have PDFs already in the `cover-letters` bucket, use the "Import Existing PDFs" button in the customer dashboard to automatically create template records for them.

Or call the import API:
```javascript
POST /api/cover-letter-templates/import-existing
Body: { userId: "user-uuid" }
```

## Security

- Row Level Security (RLS) enabled
- Users can only access their own templates
- Admins can view and edit all templates
- Storage policies match database policies
- File size limit: 5MB for PDFs

## Future Enhancements

- [ ] Template preview with sample data
- [ ] More dynamic variables (user experience, skills, etc.)
- [ ] Template sharing between users
- [ ] Template categories/tags
- [ ] Usage analytics per template
- [ ] AI-powered template suggestions
- [ ] Multi-language templates
- [ ] Template versioning

## Migration

Run the migration file to set up the database:
```bash
supabase migration up
```

Or manually run: `/supabase/migrations/20260102_create_cover_letter_templates.sql`

## Troubleshooting

### Templates not showing in campaign creation
- Ensure template is marked as `is_active = true`
- Check user authentication
- Verify template fetch API is working

### PDF upload fails
- Check file size (must be < 5MB)
- Ensure file is valid PDF (MIME type: application/pdf)
- Verify storage bucket permissions

### Variables not working
- Ensure proper syntax: `{{variable_name}}`
- Check variable names match supported list
- Verify template processing in application sending logic

## Technical Notes

- Templates are fetched in campaign creation using user ID
- PDFs are stored with timestamp to avoid name conflicts
- Text templates stored directly in database
- Admin can update text content but not PDFs
- Template updates reflect immediately for all users
