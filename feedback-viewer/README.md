# 💬 TradeMate Pro - Feedback Viewer

**App Owner Only** - Beta Feedback Dashboard

---

## 🎯 Purpose

This is a dedicated feedback viewer app that displays all beta feedback submitted through the TradeMate Pro main app. Only you (the app owner) should access this - it's not for customers or employees.

---

## 🚀 Quick Start

### **Option 1: Use the Launcher (Recommended)**

1. Run `trademate-launcher.bat`
2. Select option `[6] Feedback Viewer`
3. Browser will open automatically at `http://localhost:3005`

### **Option 2: Manual Start**

```bash
cd feedback-viewer
npm install  # First time only
npm start    # Starts on port 3005
```

---

## ✨ Features

### **Real-Time Updates**
- 🔄 Automatically refreshes when new feedback arrives
- 📡 Uses Supabase real-time subscriptions
- 🔔 No need to manually refresh!

### **Smart Filtering**
- 📊 View all feedback or filter by time period
- 📅 Today / This Week / This Month filters
- 🔍 Quick stats dashboard

### **Detailed View**
- 📝 Full message content
- 🌐 Page where feedback was submitted
- 👤 User and company information
- 🕐 Timestamp with relative time (e.g., "2h ago")
- 🗑️ Delete feedback when resolved

### **Beautiful UI**
- 🎨 Modern gradient design
- 📱 Responsive layout
- 🌈 Color-coded stats cards
- ✨ Smooth animations

---

## 📊 What You'll See

### **Stats Cards**
- **Total Feedback** - All feedback ever submitted
- **Today** - Feedback from today
- **This Week** - Feedback from last 7 days
- **Unread** - All feedback (no read/unread tracking yet)

### **Feedback List**
- Shows page path where feedback was submitted
- Preview of message (first 100 characters)
- Time submitted (relative time)
- Company ID (if available)

### **Detail Panel**
- Full message text
- Complete timestamp
- User ID and Company ID
- Browser/device information
- Metadata (if any)

---

## 🔧 Technical Details

### **Database**
- **Table:** `beta_feedback`
- **Columns:**
  - `id` - UUID primary key
  - `created_at` - Timestamp
  - `company_id` - Company UUID (nullable)
  - `user_id` - User UUID (nullable)
  - `page_path` - Where feedback was submitted
  - `user_agent` - Browser info
  - `message` - Feedback text
  - `metadata` - Additional data (JSONB)

### **Real-Time**
- Uses Supabase Realtime
- Subscribes to `beta_feedback` table changes
- Auto-reloads on INSERT/UPDATE/DELETE

### **Port**
- Runs on **Port 3005**
- Configured in `.env` file
- Won't conflict with other TradeMate apps

---

## 🔐 Security Notes

### **App Owner Only**
- This app is for **your eyes only**
- Don't share the URL with customers or employees
- Contains sensitive feedback and user information

### **Supabase Connection**
- Uses **anon key** (read-only for beta_feedback table)
- No authentication required (local use only)
- For production, add authentication

### **Future Enhancements**
- Add login/authentication
- Link to Admin Dashboard
- Email notifications for new feedback
- Export feedback to CSV
- Mark as read/resolved

---

## 📝 How Feedback Gets Here

### **From Main App**
1. User clicks **Feedback** button (bottom right)
2. Enters feedback message
3. Submits to `beta_feedback` table
4. Appears here **instantly** via real-time subscription

### **Feedback Button Location**
- Fixed position: bottom right
- Purple/blue gradient
- 💬 emoji icon
- Text: "Feedback"

---

## 🎨 Customization

### **Change Colors**
Edit `src/App.css`:
- `.stat-card.highlight` - Unread count card
- `.tab.active` - Active filter tab
- `.refresh-btn` - Refresh button

### **Change Port**
Edit `.env`:
```
PORT=3005  # Change to any available port
```

### **Add Features**
- Mark as read/resolved
- Reply to feedback
- Export to CSV
- Email notifications
- Search/filter by keyword

---

## 🐛 Troubleshooting

### **Port Already in Use**
```bash
# Kill port 3005
npx kill-port 3005

# Or use launcher's "Kill All Ports" option
```

### **No Feedback Showing**
1. Check Supabase connection (console errors?)
2. Verify `beta_feedback` table exists
3. Submit test feedback from main app
4. Check browser console for errors

### **Real-Time Not Working**
1. Check Supabase Realtime is enabled
2. Verify table has Realtime enabled
3. Check browser console for subscription errors
4. Try manual refresh button

---

## 📦 Dependencies

```json
{
  "@supabase/supabase-js": "^2.39.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1"
}
```

---

## 🚀 Next Steps

1. **Install dependencies:**
   ```bash
   cd feedback-viewer
   npm install
   ```

2. **Start the app:**
   - Use launcher option [6]
   - Or run `npm start`

3. **Test it:**
   - Open main TradeMate app
   - Click Feedback button
   - Submit test feedback
   - Watch it appear instantly!

---

## 📞 Support

This is a custom-built app for TradeMate Pro beta testing. For issues or feature requests, contact the development team.

**Built with ❤️ for TradeMate Pro**

