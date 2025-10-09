# 🏢 **TradeMate Pro - Company Onboarding System**

## ✅ **WHAT THIS IS**

A **Company + User Onboarding System** for app owners to create the first company and admin user. This is separate from regular employee management - it's for initial setup before anyone can log into the app.

## 🎯 **PURPOSE**

**The Problem:** How can users create accounts if no one can log in to create them?

**The Solution:** A dedicated onboarding system that:
- Creates companies in the `companies` table
- Creates admin users in Supabase Auth
- Links users to companies in the `users` table
- Sets up proper authentication and permissions

## 🚀 **HOW TO USE**

### **Method 1: Direct URL**
1. Make sure the app is running (`launch_dashboard.bat`)
2. Go to: `http://localhost:3000/onboarding`
3. Fill out the company onboarding form

### **Method 2: Batch File**
1. Double-click `launch_onboarding.bat`
2. It will open the onboarding page automatically

### **Method 3: Static Landing Page**
1. Open `public/onboarding.html` in your browser
2. Click "Start Company Setup"

## 📋 **ONBOARDING FORM FIELDS**

**✅ Required Information:**
- **Company Name** - Will be created in `companies` table
- **Admin Full Name** - Display name for the admin user
- **Email Address** - Used for Supabase Auth login
- **Password** - Minimum 6 characters
- **Confirm Password** - Must match password

## 🔧 **WHAT HAPPENS DURING ONBOARDING**

### **Step 1: Company Creation**
- Checks if company name already exists
- If new: Creates company in `companies` table
- If exists: Uses existing company (allows multiple admins)

### **Step 2: Authentication Setup**
- Creates user in Supabase Auth using `supabase.auth.signUp()`
- Sets up email/password authentication
- Generates secure user ID

### **Step 3: User Profile Creation**
- Creates user record in `users` table
- Links user to company via `company_id`
- Sets role as `OWNER` 
- Sets tier as `premium`
- Marks user as `active`

### **Step 4: Success**
- Shows success message
- Provides link to dashboard
- User can now log in normally

## 🗄️ **DATABASE SCHEMA INTEGRATION**

**✅ Companies Table:**
```sql
companies:
- id (UUID, PK) - Auto-generated
- name (TEXT) - Company name from form
- created_at (TIMESTAMP) - Auto-set
- street_address, city, state, etc. - Optional fields
```

**✅ Users Table:**
```sql
users:
- id (UUID, PK) - Matches Supabase Auth user ID
- email (TEXT) - From Supabase Auth
- full_name (TEXT) - From form
- company_id (UUID, FK) - Links to companies.id
- role (TEXT) - Set to 'OWNER'
- tier (TEXT) - Set to 'premium'
- active (BOOLEAN) - Set to true
- created_at (TIMESTAMP) - Auto-set
```

**✅ Supabase Auth:**
- Email/password authentication
- User metadata stored
- Secure session management

## 🔐 **AUTHENTICATION FLOW**

**After Onboarding:**
1. User goes to `/dashboard`
2. Login page appears (if not authenticated)
3. User enters email/password from onboarding
4. System validates against Supabase Auth
5. Loads user data from `users` table
6. Loads company data via `company_id`
7. User accesses full dashboard

## 🎉 **SUCCESS INDICATORS**

**✅ Onboarding Completed When:**
- Company appears in `companies` table
- User appears in Supabase Auth
- User record appears in `users` table with correct `company_id`
- User can log in at `/dashboard`
- Dashboard shows company name and user info

## 🔧 **TECHNICAL DETAILS**

**✅ Built With:**
- React functional component
- Supabase JavaScript SDK v2+
- Proper error handling and validation
- Step-by-step progress indicators
- Responsive design

**✅ Security Features:**
- Password validation (min 6 chars)
- Email format validation
- Duplicate company checking
- Secure authentication setup
- Proper error messages

**✅ Error Handling:**
- Company name conflicts
- Email already exists
- Password mismatch
- Network errors
- Database errors

## 📁 **FILES CREATED**

- `src/pages/CompanyOnboarding.js` - Main onboarding component
- `public/onboarding.html` - Static landing page
- `launch_onboarding.bat` - Quick launch script
- `COMPANY_ONBOARDING_README.md` - This documentation

## 🎯 **NEXT STEPS AFTER ONBOARDING**

1. **Test Login:** Go to `/dashboard` and log in with created credentials
2. **Create Employees:** Use the Employees page to add team members
3. **Set Up Company:** Add company details in Settings
4. **Start Using:** Begin creating customers, quotes, jobs, etc.

## 🆘 **TROUBLESHOOTING**

**❌ "Company already exists"**
- This is normal - you can add multiple admins to existing companies
- The system will use the existing company

**❌ "Email already exists"**
- Someone already signed up with this email
- Use a different email address

**❌ "Failed to create user"**
- Check internet connection
- Verify Supabase credentials are correct
- Check browser console for detailed errors

**❌ Can't access onboarding page**
- Make sure development server is running
- Try `launch_dashboard.bat` first
- Then go to `/onboarding`

## 🎉 **READY TO USE!**

The Company Onboarding System is fully functional and ready to create your first company and admin user. Once completed, you'll have a fully authenticated system ready for business use!

**🚀 Start with: `http://localhost:3000/onboarding`**
