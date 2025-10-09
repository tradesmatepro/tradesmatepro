# Customer Portal

A simple, industry-standard customer portal for service businesses. Works with TradeMate Pro and SMBMate - built to match what customers actually expect from service business portals.

## 🚀 Features

### ✅ Beta Ready (Industry Standard)
- **Simple Dashboard** - Quick overview of pending quotes, appointments, and balance
- **My Quotes** - View and approve service quotes (like Jobber)
- **Scheduled Services** - See upcoming service appointments
- **Invoices & Pay** - View bills and outstanding balance
- **Basic Messaging** - Simple communication with service provider
- **Request Service** - Easy service request form (dashboard action)
- **Profile** - Basic contact information management
- **Mobile-Friendly** - Responsive design optimized for phones

### 🚧 Coming Soon (Post-Beta)
- **Real Supabase Integration** - Connect to actual database
- **Online Payments** - Stripe integration for invoice payments
- **SMB Network Marketplace** - Request services from any business in TradeMate Pro network (like Angie's List but better)
- **Enhanced Messaging** - File attachments and notifications

## 🛠 Tech Stack

- **React 18** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Heroicons** - Beautiful SVG icons
- **Supabase** - Backend (ready for integration)

## 📁 Project Structure

```
Customer Portal/
├── src/
│   ├── components/
│   │   ├── Layout/ (Sidebar, Topbar, Layout)
│   │   ├── Common/ (LoadingSpinner, Toast)
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   └── CustomerContext.js (Beta demo auth)
│   ├── pages/
│   │   ├── Login.js (Demo login + real form)
│   │   ├── Dashboard.js (Simple overview)
│   │   ├── Quotes.js (View & approve quotes)
│   │   ├── Jobs.js (Scheduled services)
│   │   ├── Invoices.js (Bills & payments)
│   │   ├── Messages.js (Basic messaging)
│   │   ├── ServiceRequests.js (Request service form)
│   │   └── Profile.js (Contact info)
│   └── App.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Navigate to Customer Portal directory:**
   ```bash
   cd "Customer Portal"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Beta Demo Access

For beta testing, click the **"Enter Portal (Beta Demo)"** button on the login page. This will automatically log you in with demo customer data.

## 🎨 Design System

### Colors
- **Primary:** Green theme matching main TradeMate Pro app
- **Secondary:** Gray tones for neutral elements
- **Status Colors:** Blue (info), Green (success), Red (error), Yellow (warning)

### Components
- **Cards:** Modern cards with gradients and shadows
- **Buttons:** Primary, secondary, and outline variants
- **Forms:** Consistent input styling with icons
- **Tables:** Responsive tables with empty states
- **Navigation:** Sidebar with active states

### Mobile-First
- Responsive design for all screen sizes
- Touch-friendly interface
- Collapsible sidebar on mobile
- Optimized for mobile workflows

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the Customer Portal directory:

```env
# Supabase Configuration (for future integration)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_API_URL=http://localhost:3001
```

### Tailwind Configuration
The app uses the same Tailwind configuration as the main TradeMate Pro app for consistency.

## 📱 Mobile Support

The Customer Portal is designed mobile-first with:
- **Responsive Layout** - Adapts to all screen sizes
- **Touch Navigation** - Mobile-friendly sidebar and buttons
- **Optimized Forms** - Easy input on mobile devices
- **Fast Loading** - Lazy-loaded components for performance

## 🔐 Security

### Beta Security
- Demo authentication for testing
- Local storage for session management
- No sensitive data stored

### Production Security (Coming Soon)
- Supabase authentication
- JWT token management
- Row-level security (RLS)
- HTTPS enforcement

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Deploy Options
- **Vercel** - Recommended for React apps
- **Netlify** - Easy static site deployment
- **AWS S3 + CloudFront** - Scalable hosting
- **Docker** - Containerized deployment

## 🔄 Integration with Main App

The Customer Portal is designed to integrate with the main TradeMate Pro application:

### Shared Database
- Uses same Supabase database
- Shares customer, work_orders, invoices tables
- Separate customer_messages table for portal-specific communication

### API Compatibility
- Compatible with existing TradeMate Pro API
- Uses same authentication system
- Shares company_id scoping for multi-tenant support

## 📋 Next Steps

### Phase 2 - Database Integration
1. Connect to Supabase database
2. Implement real authentication
3. Load actual customer data
4. Enable service request submission

### Phase 3 - Advanced Features
1. Online payment processing
2. File upload capabilities
3. Push notifications
4. Advanced messaging features

### Phase 4 - Mobile App
1. React Native version
2. Offline capabilities
3. Push notifications
4. Camera integration

## 🐛 Known Issues

### Beta Limitations
- Demo authentication only
- No real data persistence
- Forms are disabled (placeholders)
- No file upload functionality

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- IE11 not supported

## 📞 Support

For beta testing support or questions:
- Check the main TradeMate Pro documentation
- Review the customer portal.md file
- Contact the development team

---

## 🎯 **Summary: Industry-Standard Customer Portal**

**✅ COMPLETED - Simplified to Match Industry Standards:**
- **Dashboard** - Simple overview (3 key metrics + 2 quick actions)
- **My Quotes** - Basic quote review and approval workflow
- **Scheduled Services** - Upcoming services view (renamed from "Jobs")
- **Invoices** - Bill viewing and payment info
- **Messages** - Basic messaging with service provider
- **Request Service** - Dashboard action (matches competitor UX)
- **Profile** - Contact information management
- **Mobile-First** - Responsive design optimized for phones

**🚀 FUTURE: SMB Network Marketplace**
- Angie's List-style marketplace built into TradeMate Pro network
- Request services from any business using TradeMate Pro
- No lead fees, direct relationships, integrated workflow

**Status:** ✅ **Beta Ready - Industry Standard Customer Portal**
**Next Phase:** Database integration and SMB network marketplace
