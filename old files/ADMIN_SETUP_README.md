# TradeMate Pro Admin Dashboard Setup

## 🚀 Quick Start Guide

### Step 1: Create Your First App Owner User

Before you can access the admin dashboard, you need to create your first APP_OWNER user:

1. **Run the App Owner Creator:**
   ```bash
   create_super_user.bat
   ```
   
   Or manually:
   ```bash
   node create_super_user.js
   ```

2. **Follow the prompts:**
   - Enter your email address
   - Enter a secure password
   - Enter your first and last name

3. **The script will:**
   - Create an authenticated user in Supabase Auth
   - Create a profile record with APP_OWNER role
   - Verify the setup is working

### Step 2: Launch the Admin Dashboard

Once you have your APP_OWNER user created:

1. **Run the Admin Dashboard:**
   ```bash
   launch_onboarding.bat
   ```

2. **Access the dashboard:**
   - Opens automatically at: http://localhost:3003
   - Login with the email/password you created in Step 1

## 🔧 What You Can Do in the Admin Dashboard

- **Create Customer Companies:** Set up new customer companies
- **Manage Company Owners:** Create owner accounts for each company
- **View Company Details:** See all company information
- **Manage Employees:** Add/remove company employees
- **Industry-Standard Workflow:** 3-step company setup process

## 🔐 Security Notes

- Only users with APP_OWNER role can access the admin dashboard
- The service key is used only for initial setup
- All subsequent operations use standard Supabase auth
- Admin dashboard runs on port 3003 (separate from main app)

## 🛠️ Troubleshooting

### "Profile error" when logging in
- Make sure you ran `create_super_user.bat` first
- Check that the user was created with APP_OWNER role
- Verify the profiles table exists in your database

### "Dependencies not found"
- The script will auto-install @supabase/supabase-js if needed
- Make sure Node.js is installed on your system

### Admin dashboard won't start
- Check that the admin-dashboard folder exists
- Run `npm install` in the admin-dashboard directory
- Make sure port 3003 is not in use

## 📁 Files Created

- `create_super_user.js` - Node.js script to create APP_OWNER user
- `create_super_user.bat` - Windows batch file to run the script
- `launch_onboarding.bat` - Launches the admin dashboard
- `ADMIN_SETUP_README.md` - This documentation

## 🔄 Next Steps

After setting up your admin access:

1. Create your first customer company
2. Set up company owners and employees  
3. Test the full workflow
4. Begin onboarding real customers

---

**Need Help?** Check the console logs in both the terminal and browser developer tools for detailed error messages.
