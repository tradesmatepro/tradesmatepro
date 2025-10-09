# Service Tags Integration Guide

## Overview
This document provides instructions for integrating the Service Tags management system into TradeMate Pro.

## Database Setup

1. **Run the migration script** in your Supabase dashboard:
   ```sql
   -- Execute the contents of migrations/001_create_service_tags.sql
   ```

2. **Verify tables were created**:
   - `service_tags` - Master list of available service tags
   - `company_service_tags` - Junction table linking companies to their service tags

## Backend API Integration

### If you have an Express.js backend server:

1. **Import the service tags routes** in your main server file:
   ```javascript
   import serviceTagsRoutes from './src/api/serviceTagsRoutes.js';
   
   // Register the routes
   app.use('/api/service-tags', serviceTagsRoutes);
   ```

### If you're using Supabase Edge Functions:

1. **Create a new Edge Function** for service tags:
   ```bash
   supabase functions new service-tags
   ```

2. **Implement the API endpoints** using the logic from `src/api/serviceTagsRoutes.js`

### If you're using a different backend:

1. **Implement these API endpoints**:
   - `GET /api/service-tags` - Get all available service tags
   - `GET /api/service-tags/company` - Get company's assigned service tags
   - `POST /api/service-tags/company` - Add service tag to company
   - `DELETE /api/service-tags/company/:id` - Remove service tag from company
   - `GET /api/service-tags/available` - Get unassigned service tags

## Frontend Integration

The frontend components are already integrated:

✅ **Service Tags page** added to Settings under "Company & Business"
✅ **Navigation updated** with TagIcon
✅ **Component imported** in Settings.js
✅ **Route configured** for 'service-tags' tab

## Testing the Integration

1. **Navigate to Settings > Company & Business > Service Tags**
2. **Verify the page loads** (may show API errors until backend is connected)
3. **Test adding/removing service tags** once backend is connected

## Database Schema Details

### service_tags table:
- `id` (UUID) - Primary key
- `name` (TEXT) - Unique service tag name
- `description` (TEXT) - Optional description
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### company_service_tags table:
- `id` (UUID) - Primary key
- `company_id` (UUID) - References companies table
- `service_tag_id` (UUID) - References service_tags table
- `created_at` (TIMESTAMPTZ) - Assignment timestamp
- Unique constraint on (company_id, service_tag_id)

## Default Service Tags

The migration includes these default service tags:
- HVAC
- Plumbing
- Electrical
- Roofing
- Flooring
- Painting
- Carpentry
- Drywall
- Insulation
- Windows & Doors
- Concrete
- Landscaping
- Pool & Spa
- Solar
- Security Systems
- Appliance Repair
- Cleaning
- General Contracting

## Security & Permissions

- **Row Level Security (RLS)** enabled on both tables
- **service_tags** are publicly readable (reference data)
- **company_service_tags** restricted to company users
- Only **admins and owners** can modify company service tags
- All changes are **audited** in the audit_logs table

## API Response Examples

### GET /api/service-tags/company
```json
[
  {
    "id": "uuid",
    "company_id": "uuid", 
    "service_tag_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "service_tag": {
      "id": "uuid",
      "name": "HVAC",
      "description": "Heating, Ventilation, and Air Conditioning services"
    }
  }
]
```

### POST /api/service-tags/company
```json
{
  "service_tag_id": "uuid"
}
```

## Troubleshooting

### Common Issues:

1. **"Failed to load service tags"**
   - Check if backend API is running
   - Verify API routes are registered
   - Check authentication token

2. **"Service tag already assigned"**
   - This is expected behavior (unique constraint)
   - User should see appropriate error message

3. **Permission denied errors**
   - Verify user has admin/owner role
   - Check RLS policies are correctly applied

## Next Steps

After integration, you can:
1. **Use service tags for customer matching** - Match customer requests to companies with relevant service tags
2. **Add service tag filtering** to other parts of the app
3. **Create reports** showing service tag distribution
4. **Implement notifications** based on service tags

## Files Created/Modified

### New Files:
- `migrations/001_create_service_tags.sql`
- `src/api/serviceTagsRoutes.js`
- `src/pages/Settings/ServiceTags.js`
- `docs/SERVICE_TAGS_INTEGRATION.md`

### Modified Files:
- `src/pages/Settings.js` - Added service tags tab and import
- Navigation and permissions already support the new page

The Service Tags system is now ready for use once the backend API is connected!
