# Service Request System Integration Guide

## Overview
The Service Request System allows customers to submit service requests that are automatically matched to contractors based on their service tags. This creates a marketplace-like experience where customers can get help quickly and contractors can find new business.

## Database Setup

### 1. Run the migration script
Execute the contents of `migrations/002_create_service_requests.sql` in your Supabase dashboard.

### 2. Tables Created
- **service_requests** - Customer service requests
- **service_request_responses** - Contractor responses to requests
- **business_settings** - Updated with emergency_fee field

### 3. Database Functions
- `accept_service_request()` - Handles first-accept-wins logic
- `decline_service_request()` - Records contractor declines
- `expire_old_service_requests()` - Cleanup function for expired requests

## Backend API Integration

### If you have an Express.js backend:
```javascript
import serviceRequestRoutes from './src/api/serviceRequestRoutes.js';
app.use('/api/service-requests', serviceRequestRoutes);
```

### API Endpoints Created:
- `POST /api/service-requests` - Customer creates request
- `GET /api/service-requests` - List requests (role-based filtering)
- `GET /api/service-requests/:id` - Get request details
- `POST /api/service-requests/:id/accept` - Contractor accepts
- `POST /api/service-requests/:id/decline` - Contractor declines
- `PUT /api/service-requests/:id/status` - Update request status

## Frontend Integration

### Customer Portal Pages:
✅ **Request Service** (`/customer/request-service`)
- Form to submit new service requests
- Service type selection from service_tags
- Emergency toggle with fee display
- Budget and contact information

✅ **Request History** (`/customer/requests`)
- View all submitted requests
- Filter by status (open, accepted, completed, etc.)
- Track request progress

### Contractor Dashboard:
✅ **Incoming Requests** (`/incoming-requests`)
- View available requests for company's service tags
- Accept/decline functionality with first-accept-wins
- Real-time updates (30-second polling)
- Emergency request highlighting

### Navigation Integration:
✅ **Added to Operations section** - "Incoming Requests" menu item
✅ **Customer portal routes** - Request service and history pages
✅ **Permissions system** - Integrated with existing role-based access

## How the System Works

### 1. Customer Submits Request
- Customer fills out service request form
- System determines emergency fee from contractors
- Request stored with 24-hour expiration
- Status set to 'open'

### 2. Contractor Matching
- System finds companies with matching service tags
- Contractors see requests in "Incoming Requests" page
- Real-time notifications (to be implemented)

### 3. First-Accept Wins
- Multiple contractors can see the same request
- First contractor to click "Accept" gets the job
- Request status changes to 'accepted'
- Other contractors can no longer accept

### 4. Job Completion
- Contractor can update status to 'completed'
- Customer can leave reviews (to be implemented)
- Audit trail maintained throughout

## Request Lifecycle

```
OPEN → ACCEPTED → COMPLETED
  ↓        ↓
EXPIRED  CANCELLED
  ↓
DECLINED (if no contractors accept)
```

### Status Definitions:
- **open** - Available for contractors to accept
- **accepted** - Assigned to a contractor
- **completed** - Work finished
- **declined** - No contractors available
- **expired** - 24 hours passed without acceptance
- **cancelled** - Customer cancelled

## Emergency Handling

### Emergency Requests:
- Highlighted with red badges
- Show emergency fees upfront
- Prioritized in contractor view
- Can have higher pricing

### Emergency Fee Setup:
- Set in Settings > Company & Business > Business Settings
- Applied automatically to emergency requests
- Displayed to customers before submission

## Matching Logic

### Service Tag Matching:
1. Customer selects service type (from service_tags table)
2. System queries company_service_tags for matching companies
3. Only companies with that service tag see the request
4. First company to accept gets the job

### Geographic Considerations:
- Currently no geographic filtering (future enhancement)
- All companies with matching service tags see all requests
- Could be enhanced with location-based filtering

## Security & Permissions

### Role-Based Access:
- **Customers**: Can create and view their own requests
- **Contractors**: Can view requests for their service tags and accept/decline
- **Admins/Owners**: Full access to company's requests

### Data Protection:
- RLS policies structured but disabled for beta
- Company-scoped data access
- Audit logging for all actions

## Testing the System

### 1. Setup Service Tags
- Go to Settings > Company & Business > Service Tags
- Add service tags for your company (e.g., HVAC, Plumbing)

### 2. Test Customer Flow
- Navigate to `/customer/request-service`
- Submit a test request
- Check `/customer/requests` for status

### 3. Test Contractor Flow
- Navigate to `/incoming-requests`
- View available requests
- Test accept/decline functionality

## Future Enhancements

### Planned Features:
- **Real-time notifications** - WebSocket or push notifications
- **Geographic filtering** - Match by location/radius
- **Contractor ratings** - Customer reviews and ratings
- **Pricing negotiations** - Quote system integration
- **Mobile app integration** - Native mobile experience

### Integration Opportunities:
- **SMS notifications** - Twilio integration for alerts
- **Email notifications** - SendGrid for request updates
- **Calendar integration** - Auto-schedule accepted jobs
- **Payment processing** - Collect deposits on acceptance

## Troubleshooting

### Common Issues:

1. **"No contractors available"**
   - Check if companies have matching service tags
   - Verify service_tags and company_service_tags tables

2. **Requests not appearing**
   - Check role-based filtering in API
   - Verify company has correct service tags

3. **Accept/decline not working**
   - Check database functions are created
   - Verify API routes are connected

4. **Permission errors**
   - Check user roles and permissions
   - Verify RLS policies (if enabled)

## Files Created/Modified

### New Files:
- `migrations/002_create_service_requests.sql`
- `src/api/serviceRequestRoutes.js`
- `src/pages/IncomingRequests.js`
- `src/pages/CustomerPortal/RequestService.js`
- `src/pages/CustomerPortal/RequestHistory.js`
- `docs/SERVICE_REQUESTS_INTEGRATION.md`

### Modified Files:
- `src/utils/simplePermissions.js` - Added INCOMING_REQUESTS module
- `src/App.js` - Added service request routes

## Database Schema Reference

### service_requests table:
```sql
id UUID PRIMARY KEY
customer_id UUID → customers(id)
company_id UUID → companies(id) (null until accepted)
service_tag_id UUID → service_tags(id)
description TEXT
emergency BOOLEAN
customer_budget NUMERIC(12,2)
emergency_fee NUMERIC(12,2)
status TEXT (open/accepted/declined/expired/completed/cancelled)
customer_location TEXT
customer_phone TEXT
customer_email TEXT
preferred_time TEXT
created_at TIMESTAMPTZ
accepted_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
expires_at TIMESTAMPTZ (24 hours from creation)
```

### service_request_responses table:
```sql
id UUID PRIMARY KEY
service_request_id UUID → service_requests(id)
company_id UUID → companies(id)
response_type TEXT (accept/decline/quote)
quoted_price NUMERIC(12,2)
estimated_arrival TEXT
notes TEXT
created_at TIMESTAMPTZ
```

The Service Request System is now ready to connect customers with contractors efficiently! 🚀
