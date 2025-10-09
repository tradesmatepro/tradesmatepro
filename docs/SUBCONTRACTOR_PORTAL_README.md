# Subcontractor Portal - TradeMate Pro

## 🎯 Overview

The Subcontractor Portal is a comprehensive self-service platform that allows subcontractors to manage their work orders, upload compliance documents, log hours, and maintain their profile information. This system provides better functionality than competitors like ServiceTitan and Jobber.

## ✅ **Key Features**

### **🔐 Secure Authentication**
- Separate login portal for subcontractors (role = 'subcontractor')
- Company-scoped data access (multi-tenant security)
- Role-based permissions (subcontractors see only their own data)

### **📋 Work Order Management**
- View assigned work orders with customer details
- Real-time status tracking (ASSIGNED → IN_PROGRESS → COMPLETED)
- Customer contact information and job details
- Work order assignment history

### **📄 Document Compliance Tracking**
- Upload and manage compliance documents (W9, Insurance, License, etc.)
- Automatic expiration tracking with visual alerts
- Document status indicators (Valid, Expiring Soon, Expired)
- Self-service document renewal workflow

### **⏰ Timesheet Management**
- Log hours with clock in/out times
- Link time entries to specific work orders
- Weekly and monthly time summaries
- Export-ready timesheet data

### **🚨 Compliance Monitoring**
- Real-time compliance status dashboard
- Automatic alerts for expired documents
- 30-day expiration warnings
- Visual compliance indicators

## 🗄️ **Database Schema**

The system uses these exact tables (do not modify):

### **subcontractors**
```sql
- id (UUID, Primary Key)
- company_id (UUID, References companies)
- name, email, phone, trade
- status ('ACTIVE', 'INACTIVE')
- insurance_expiration, license_number, license_expiration
- created_at, updated_at
```

### **subcontractor_work_orders**
```sql
- id (UUID, Primary Key)
- subcontractor_id (References subcontractors)
- work_order_id (References work_orders)
- assigned_at, status ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED')
- notes
```

### **subcontractor_documents**
```sql
- id (UUID, Primary Key)
- subcontractor_id (References subcontractors)
- doc_type, file_url, uploaded_at, expiration_date
```

### **subcontractor_timesheets**
```sql
- id (UUID, Primary Key)
- subcontractor_id (References subcontractors)
- work_order_id (References work_orders, Optional)
- work_date, clock_in, clock_out, total_hours
- notes, created_at
```

## 🚀 **API Endpoints**

### **Subcontractor Management**
- `POST /api/subcontractors` → Create subcontractor (admin only)
- `GET /api/subcontractors` → List subcontractors with filters
- `GET /api/subcontractors/:id` → Get details with docs/work orders
- `PUT /api/subcontractors/:id` → Update subcontractor (admin only)
- `DELETE /api/subcontractors/:id` → Archive (set status = 'INACTIVE')

### **Document Management**
- `POST /api/subcontractors/:id/documents` → Upload document metadata
- `GET /api/subcontractors/:id/documents` → List documents with expiration flags

### **Work Order Management**
- `POST /api/subcontractors/:id/work-orders` → Assign work order (admin only)
- `GET /api/subcontractors/:id/work-orders` → List assigned work orders

### **Timesheet Management**
- `POST /api/subcontractors/:id/timesheets` → Log hours
- `GET /api/subcontractors/:id/timesheets` → List timesheets with date filters

## 🎨 **Frontend Components**

### **SubcontractorDashboard.js**
- Main portal interface with tabbed navigation
- Compliance alerts and status overview
- Quick stats (active work orders, documents, hours)
- Profile information display

### **SubcontractorList.js** (Admin View)
- Searchable/filterable subcontractor list
- Compliance status indicators
- Quick actions (view, edit, archive)
- Filter by status, trade, search terms

### **SubcontractorDetail.js** (Admin View)
- Complete profile view with contact info
- Compliance status and issue tracking
- Document and work order summaries
- Edit functionality for admins

### **SubcontractorWorkOrders.js**
- List of assigned work orders
- Customer contact information
- Status tracking and updates
- Filter by status (all, active, completed)

### **SubcontractorDocuments.js**
- Document upload interface
- Expiration tracking with visual alerts
- Document type categorization
- Download/view functionality

### **SubcontractorTimesheets.js**
- Time entry form with validation
- Weekly/monthly summaries
- Clock in/out functionality
- Export capabilities

## ⚙️ **Setup Instructions**

### 1. Backend Integration
```javascript
// Add to your Express app
import subcontractorRoutes from './src/api/subcontractorRoutes.js';
app.use('/api/subcontractors', subcontractorRoutes);
```

### 2. Frontend Routing
```javascript
// Add to your React Router
import { 
  SubcontractorDashboard, 
  SubcontractorList, 
  SubcontractorDetail 
} from './src/components/Subcontractors';

// Subcontractor portal routes
<Route path="/subcontractor/dashboard" component={SubcontractorDashboard} />

// Admin routes
<Route path="/admin/subcontractors" component={SubcontractorList} />
<Route path="/admin/subcontractors/:id" component={SubcontractorDetail} />
```

### 3. Authentication Setup
```javascript
// Supabase Auth configuration for subcontractors
const { data, error } = await supabase.auth.signInWithPassword({
  email: subcontractorEmail,
  password: password,
  options: {
    data: { role: 'subcontractor' }
  }
});
```

## 🔒 **Security & Permissions**

### **Data Scoping**
- All queries scoped by `company_id` for multi-tenant security
- Row Level Security (RLS) policies enforce company isolation
- Subcontractors can only access their own data

### **Role-Based Access**
- **Subcontractors**: View/edit own profile, documents, timesheets, work orders
- **Admins**: Full CRUD access to all subcontractor data within company
- **Employees**: No access to subcontractor portal

### **Document Security**
- File URLs stored in database (actual files in cloud storage)
- Subcontractors can upload/view their own documents
- Admins can view all company subcontractor documents

## 🏆 **Competitive Advantages**

### **Better than ServiceTitan/Jobber:**

1. **Built-in Compliance Tracking**
   - Automatic expiration monitoring
   - Visual compliance dashboard
   - Proactive renewal reminders

2. **Self-Service Portal**
   - Subcontractors manage their own data
   - Reduces admin workload
   - Real-time updates

3. **Integrated Timesheet System**
   - Link hours to specific work orders
   - Automatic calculations
   - Export-ready data

4. **Real-Time Work Order Assignment**
   - Instant notifications
   - Status tracking
   - Customer contact integration

5. **Document Compliance Automation**
   - Flag expired insurance/licenses
   - Automated compliance reporting
   - Audit trail maintenance

## 🧪 **Testing**

### **Manual Testing Checklist**
- [ ] Subcontractor can log in and see dashboard
- [ ] Compliance alerts show for expired documents
- [ ] Work orders display with customer info
- [ ] Document upload works with expiration tracking
- [ ] Timesheet logging calculates hours correctly
- [ ] Admin can create/manage subcontractors
- [ ] Filtering and search work properly
- [ ] Company data isolation is enforced

### **API Testing**
```bash
# Test subcontractor creation
curl -X POST /api/subcontractors \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Sub","email":"test@example.com","trade":"HVAC"}'

# Test document upload
curl -X POST /api/subcontractors/123/documents \
  -H "Authorization: Bearer $SUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doc_type":"Insurance","file_url":"https://example.com/doc.pdf","expiration_date":"2024-12-31"}'
```

## 🔧 **Configuration**

### **Document Types**
Configure allowed document types in the frontend:
```javascript
const documentTypes = [
  'W9', 'Insurance', 'License', 'Certification', 'Contract', 'Other'
];
```

### **Trade Categories**
Customize trade options:
```javascript
const trades = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Flooring', 'General'
];
```

### **Compliance Rules**
Adjust expiration warning periods:
```javascript
const EXPIRATION_WARNING_DAYS = 30; // Show warnings 30 days before expiration
```

## 📞 **Support**

For technical support or questions:
1. Check API endpoint responses for error details
2. Verify authentication tokens and permissions
3. Ensure company_id scoping is working correctly
4. Review browser console for frontend errors

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2024
