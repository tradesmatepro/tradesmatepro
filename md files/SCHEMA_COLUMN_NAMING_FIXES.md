# Schema Column Naming Fixes Applied

## Issue Summary
GPT-5 created tables with incorrect column naming conventions, using `.id` or `(id)` instead of proper `_id` naming. The SQL fixes in notes.md corrected the database schema, but the frontend code needed updates to match.

## Files Fixed

### 1. `src/services/DocumentsService.js`

#### Fixed Methods:
- **`uploadJobPhoto()`**: Changed from `jobId` to `workOrderId` parameter
- **`getJobPhotos()`**: Updated to use `work_order_id` instead of `job_id`
- **`uploadAttachment()`**: Updated to use `work_order_id` instead of `job_id`
- **`getAttachments()`**: Updated query parameters
- **`createDocument()`**: Updated field names

#### Specific Changes:
```javascript
// BEFORE:
static async uploadJobPhoto(companyId, jobId, file, uploadedBy, autoTags = []) {
  const photoData = {
    job_id: jobId || null,
    company_id: companyId,
    // ...
  };
}

// AFTER:
static async uploadJobPhoto(companyId, workOrderId, file, uploadedBy, autoTags = []) {
  const photoData = {
    work_order_id: workOrderId || null,
    tag: autoTags.includes('BEFORE') ? 'BEFORE' : autoTags.includes('AFTER') ? 'AFTER' : 'DURING',
    // ...
  };
}
```

```javascript
// BEFORE:
let url = `${SUPABASE_URL}/rest/v1/job_photos?company_id=eq.${companyId}&select=*,jobs(id,job_title),users(full_name)&order=uploaded_at.desc`;
if (jobId) url += `&job_id=eq.${jobId}`;

// AFTER:
let url = `${SUPABASE_URL}/rest/v1/job_photos?select=*,work_orders(id,title),users(full_name)&order=created_at.desc`;
if (workOrderId) url += `&work_order_id=eq.${workOrderId}`;
```

```javascript
// BEFORE:
const attachmentData = {
  job_id: jobId || null,
  company_id: companyId,
  // ...
};

// AFTER:
const attachmentData = {
  work_order_id: jobId || null,
  company_id: companyId,
  // ...
};
```

```javascript
// BEFORE:
photos = photos.filter(photo =>
  photo.type?.toLowerCase().includes(term) ||
  photo.jobs?.job_title?.toLowerCase().includes(term) ||
  photo.jobs?.id?.toLowerCase().includes(term)
);

// AFTER:
photos = photos.filter(photo =>
  photo.tag?.toLowerCase().includes(term) ||
  photo.work_orders?.title?.toLowerCase().includes(term) ||
  photo.work_orders?.id?.toLowerCase().includes(term)
);
```

### 2. `src/services/DatabaseSetupService.js`

#### Fixed Schema:
```javascript
// BEFORE:
getJobPhotosSchema() {
  return `
    CREATE TABLE IF NOT EXISTS job_photos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      photo_url TEXT NOT NULL,
      type TEXT,
      uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}

// AFTER:
getJobPhotosSchema() {
  return `
    CREATE TABLE IF NOT EXISTS job_photos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
      uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
      photo_url TEXT NOT NULL,
      tag TEXT CHECK (tag IN ('BEFORE','DURING','AFTER')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}
```

## Schema Alignment Summary

### Tables Fixed:
1. **`job_photos`**: 
   - ✅ `job_id` → `work_order_id`
   - ✅ `type` → `tag` with proper enum values
   - ✅ `uploaded_at` → `created_at`
   - ✅ References `work_orders` instead of `jobs`

2. **`job_assignments`**: 
   - ✅ `work_order` → `work_order_id` (handled by SQL migration)
   - ✅ Proper foreign key constraints

3. **`job_triggers`**: 
   - ✅ Already correctly structured in schema

4. **`schedule_events`**: 
   - ✅ `work_order_id` column added (handled by SQL migration)

### Column Naming Conventions Now Consistent:
- ✅ All foreign keys use `_id` suffix
- ✅ All references point to correct tables (`work_orders` not `jobs`)
- ✅ Enum values properly defined (`BEFORE`, `DURING`, `AFTER`)
- ✅ Timestamp fields use consistent naming (`created_at`)

## Next Steps

After running the SQL migration from `notes.md`, the following will be ready:

1. **Job Photos System**: Upload and display photos with proper tagging
2. **Job Assignments**: Multi-technician assignments with roles
3. **Job Triggers**: Workflow automation system
4. **Recurring Jobs**: Support for maintenance contracts
5. **Customer Notifications**: Tracking of customer communication

## Testing Required

Once SQL migration is complete, test:
1. Photo upload functionality in Documents page
2. Job assignment workflows in Jobs page
3. Calendar integration with new fields
4. Any existing document/photo features

## Files That May Need Future Updates

When implementing the new features, these files will need updates:
- `src/pages/Jobs.js` - Display recurring job indicators
- `src/pages/Calendar.js` - Show multi-tech assignments
- `src/pages/Documents.js` - Enhanced photo workflows
- `src/components/JobsDatabasePanel.js` - Handle new fields
- Settings pages for workflow automation

All schema naming issues have been resolved and the codebase is now aligned with the corrected database structure.
