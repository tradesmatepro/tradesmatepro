# 🚀 TradeMate Pro - Quick Start Guide

## 🎯 How to Run the App

### **Option 1: Universal Launcher (Recommended)**
Double-click this file:
```
TradeMate-Launcher.bat
```

Then select:
- **[2] TradeMate Pro Main** (Port 3004) ← Main contractor app
- **[1] Admin Dashboard** (Port 3003) ← Create companies
- **[3] Customer Portal** (Port 3001) ← Customer interface
- **[4] Dev Tools** (Port 3002) ← Development utilities
- **[5] Error Logger** (Port 4000) ← Error collection

### **Option 2: Run Directly**
```bash
# Main App (Port 3004)
npm run dev-main

# Admin Dashboard (Port 3003)
cd admin-dashboard
npm start

# Customer Portal (Port 3001)
cd "Customer Portal"
npm start
```

---

## 📂 Project Structure

```
TradeMate Pro Webapp/
├── 🚀 TradeMate-Launcher.bat    ← START HERE!
├── 📦 package.json               ← Dependencies
├── ⚙️ craco.config.js            ← Build config
├── 🎨 tailwind.config.js         ← Styling config
├── 🔐 .env                       ← Environment variables
│
├── 📁 src/                       ← Main app source code
├── 📁 admin-dashboard/           ← Admin dashboard app
├── 📁 Customer Portal/           ← Customer portal app
├── 📁 devtools/                  ← Dev tools app
│
├── 📁 docs/                      ← Documentation
├── 📁 scripts/                   ← Utility scripts
├── 📁 database/                  ← Database schemas
├── 📁 sql files/                 ← SQL migrations
├── 📁 How tos/                   ← Setup guides
└── 📁 old files/                 ← Archived files
```

---

## 🔧 Useful Scripts

### **Database Management**
```bash
# Run SQL file
node scripts/execute-sql.js path/to/file.sql

# Deploy schema
node scripts/deploy-enhanced.js
```

### **Development**
```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build
```

---

## 📚 Documentation

- **Setup Guides:** `How tos/` folder
- **Database Docs:** `docs/` folder
- **API Docs:** `docs/` folder
- **Troubleshooting:** `How tos/5-TROUBLESHOOTING-COMMON-ISSUES.md`

---

## 🆘 Common Issues

### **Port Already in Use**
Run the launcher and select `[K] Kill All Ports`

### **App Won't Start**
1. Make sure all config files are in root:
   - `package.json`
   - `craco.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `webpack-error-capture.js`
   - `postcss-loader-wrapper.js`
   - `.env`

2. Reinstall dependencies:
   ```bash
   npm install
   ```

### **Database Errors**
Check your `.env` file has correct Supabase credentials

---

## 🎊 You're Ready!

**Just run:** `TradeMate-Launcher.bat` and select option **[2]**

The app will open at: **http://localhost:3004**

---

## 📞 Need Help?

Check the `How tos/` folder for detailed guides on:
- Authentication
- Database access
- Running SQL commands
- Troubleshooting
- Architecture overview

