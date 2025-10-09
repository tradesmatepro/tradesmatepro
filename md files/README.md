# TradeMate Pro Dashboard

A modern, responsive web dashboard for field service management built with React and Tailwind CSS.

## 🚀 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Modular Architecture**: Well-organized components for easy maintenance
- **React Router**: Client-side routing for smooth navigation
- **Professional Layout**: Fixed sidebar with collapsible mobile menu
- **Ready for Integration**: Structured for easy Supabase integration

## 📋 Dashboard Sections

- **Dashboard**: Overview with stats, quick actions, and recent activity
- **Employees**: Team member management (placeholder)
- **Scheduling**: Calendar and job scheduling (placeholder)
- **Quotes**: Quote creation and management (placeholder)
- **Jobs**: Job tracking and management (placeholder)
- **Invoices**: Billing and payment tracking (placeholder)
- **Customers**: Customer relationship management (placeholder)
- **Documents**: Document storage and management (placeholder)
- **Settings**: System configuration (placeholder)

## 🛠 Tech Stack

- **React 18**: Modern React with hooks
- **React Router 6**: Client-side routing
- **Tailwind CSS 3**: Utility-first CSS framework
- **Heroicons**: Beautiful SVG icons
- **PostCSS**: CSS processing
- **Create React App**: Development environment

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Quick Start

**Option 1: Full Development Setup (Recommended)**
```bash
# Terminal 1: Main React app
npm run dev-main

# Terminal 2: Error logging server (for AI debugging)
npm run dev-error-server
```

**Option 2: Use the Batch File (Windows)**
```bash
# Double-click start_dashboard.bat
# It will automatically install dependencies and start the server
```

**Option 3: Manual Setup**
```bash
npm install
npm start
```

**Then open:** `http://localhost:3000`

### 🤖 AI-Powered Error Detection

This project includes an **automated error detection system** that allows AI assistants (Claude/GPT) to see real runtime errors automatically:

- **Global error capture** on every page
- **Auto-saved every 30 seconds** to `error_logs/latest.json`
- **No manual exports needed** - AI can read errors directly
- **Real HTTP 400s, database errors, JavaScript errors** visible instantly

**For AI Assistants:** Always check `error_logs/latest.json` first to see current runtime errors before making any fixes!

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.js          # Main layout wrapper
│   │   ├── Sidebar.js         # Navigation sidebar
│   │   └── TopBar.js          # Top navigation bar
│   └── Common/
│       ├── PageHeader.js      # Reusable page header
│       └── PlaceholderPage.js # Template for placeholder pages
├── pages/
│   ├── Dashboard.js           # Main dashboard with stats
│   ├── Employees.js           # Employee management (placeholder)
│   ├── Scheduling.js          # Calendar scheduling (placeholder)
│   ├── Quotes.js              # Quote management (placeholder)
│   ├── Jobs.js                # Job tracking (placeholder)
│   ├── Invoices.js            # Invoice management (placeholder)
│   ├── Customers.js           # Customer management (placeholder)
│   ├── Documents.js           # Document management (placeholder)
│   └── Settings.js            # System settings (placeholder)
├── App.js                     # Main app component with routing
├── index.js                   # App entry point
└── index.css                  # Global styles and Tailwind imports
```

## 🎨 Design System

### Colors
- **Primary**: Green theme (`#339e63`) for construction/trade industry
- **Gray Scale**: Modern gray palette for text and backgrounds
- **Status Colors**: Green, blue, yellow, red for different states

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Primary (green) and secondary (white) variants
- **Navigation**: Active states with green accent
- **Typography**: Inter font family for modern, readable text

## 🤖 For AI Assistants (Claude/GPT)

**🎉 BREAKTHROUGH: You can now see real runtime errors automatically!**

### **Always start by checking `error_logs/latest.json`** before making any fixes:

```bash
# 1. Start both servers
npm run dev-main          # Main React app (port 3000)
npm run dev-error-server  # Error logging (port 4000)

# 2. Navigate in the app to reproduce issues
# 3. Wait 30+ seconds for auto-capture
# 4. Read error_logs/latest.json to see real errors
# 5. Apply targeted fixes based on actual error messages
# 6. Verify by checking latest.json again
```

**Real errors you can now see:**
- HTTP 400/500 errors from Supabase API calls
- JavaScript console errors and exceptions
- Database relationship/schema issues
- Network connection problems

**No more guessing!** 🎉

## 🔧 Customization

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.js`
3. Add navigation item to `src/components/Layout/Sidebar.js`

### Styling

The project uses Tailwind CSS with custom configuration in `tailwind.config.js`. Key customizations:

- Custom color palette
- Extended spacing and sizing
- Custom component classes in `src/index.css`

## 🚀 Next Steps

This is a foundation ready for:

1. **Supabase Integration**: Add authentication and database connections
2. **Real Data**: Replace placeholder content with actual data
3. **Forms**: Add create/edit forms for each section
4. **Charts**: Add data visualization components
5. **Mobile App**: Extend to React Native for field workers

## 📱 Responsive Behavior

- **Desktop**: Fixed sidebar with full navigation
- **Tablet**: Collapsible sidebar with overlay
- **Mobile**: Hidden sidebar with hamburger menu
- **All Sizes**: Responsive grid layouts and typography

## 🔒 Security Ready

The structure is prepared for:
- Authentication integration
- Role-based access control
- Secure API connections
- Data validation

---

**Ready to build the future of field service management!** 🔨⚡
