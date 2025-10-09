# Approved Quotes Workflow - Industry Standard

## 🤔 **YOUR QUESTION:**

*"what after its accepted but they dont want it scheduled yet? it still lives in quotes area until its scheduled? whats standard for this?"*

---

## 🏆 **INDUSTRY STANDARD ANSWER:**

### **ServiceTitan, Jobber, Housecall Pro Pattern:**

**Approved quotes that aren't scheduled yet live in the "JOBS" area as "Unscheduled Jobs" / "Job Backlog"**

### **Workflow:**
```
1. Quote Created → Lives in "Quotes" (status: draft/sent)
2. Quote Accepted → Moves to "Jobs" (status: approved, unscheduled)
3. Job Scheduled → Stays in "Jobs" (status: scheduled)
4. Job Completed → Stays in "Jobs" (status: completed)
5. Job Invoiced → Moves to "Invoices" (status: invoiced)
```

---

## 📊 **WHERE THINGS LIVE:**

### **Quotes Page:**
- ✅ Draft quotes
- ✅ Sent quotes (waiting for customer response)
- ✅ Rejected quotes (for reference)
- ❌ **NOT approved quotes** (those move to Jobs)

### **Jobs Page:**
- ✅ **Approved (Unscheduled)** - Customer said yes, but no date/time yet
- ✅ **Scheduled** - Has date/time assigned
- ✅ **In Progress** - Technician is working on it
- ✅ **Completed** - Work is done, ready to invoice

### **Calendar:**
- ✅ Only **scheduled** jobs (with date/time)
- ✅ Shows "Unscheduled Jobs" count in sidebar/backlog

---

## ✅ **WHAT YOU CURRENTLY HAVE:**

### **Your Current Implementation:**
Looking at your code, you ALREADY have this pattern partially implemented!

**Jobs.js (Line 260-264):**
```javascript
if (statusFilter === 'unscheduled') ok = !isScheduled;
```

**Jobs.js (Line 342-346):**
```javascript
<ModernStatCard
  title="Unscheduled"
  value={filteredJobs.filter(j => !j.start_time).length}
  icon={ExclamationTriangleIcon}
  gradient="orange"
  onClick={() => setStatusFilter('unscheduled')}
/>
```

**Calendar.js (Line 145-157):**
```javascript
// Load backlog (unscheduled work orders)
const loadBacklog = async () => {
  const res = await supaFetch('work_orders?status=in.(SCHEDULED,IN_PROGRESS)&select=...', ...);
  setBacklog(data);
};
```

---

## 🔧 **WHAT NEEDS TO BE FIXED:**

### **Problem 1: Approved Quotes Stay in Quotes Page**
**Current Behavior:**
- User accepts quote
- Clicks "No" to scheduling
- Quote stays in Quotes page ❌

**Industry Standard:**
- User accepts quote
- Clicks "No" to scheduling
- Quote moves to Jobs page as "Unscheduled" ✅

### **Problem 2: Jobs Page Query Doesn't Include Approved**
**Current Query (Jobs.js):**
```javascript
// Loads jobs with status: scheduled, in_progress, completed, etc.
// But NOT approved (unscheduled)
```

**Should Be:**
```javascript
// Load jobs with status: approved, scheduled, in_progress, completed
work_orders?status=in.(approved,scheduled,in_progress,completed)
```

---

## 🎯 **RECOMMENDED FIX:**

### **Step 1: Update Jobs Page Query**
**File:** `src/hooks/useJobsDatabase.js` or wherever jobs are loaded

**Change:**
```javascript
// ❌ BEFORE:
work_orders?status=in.(scheduled,in_progress,completed)

// ✅ AFTER:
work_orders?status=in.(approved,scheduled,in_progress,completed)
```

### **Step 2: Update Quotes Page Query**
**File:** `src/components/QuotesDatabasePanel.js`

**Change:**
```javascript
// ❌ BEFORE:
work_orders?status=in.(quote,sent,approved,rejected)

// ✅ AFTER:
work_orders?status=in.(quote,sent,rejected)
// Exclude 'approved' - those go to Jobs page
```

### **Step 3: Update Navigation Logic**
**File:** `src/components/QuotesDatabasePanel.js` (Line 757)

**Already correct!** ✅
```javascript
if (shouldSchedule) {
  navigate(`/jobs`, { state: { openScheduler: true, jobData: {...} } });
} else {
  navigate(`/jobs`); // ✅ Goes to Jobs page (unscheduled)
}
```

---

## 📋 **STATUS FLOW:**

### **Complete Pipeline:**
```
QUOTES PAGE:
├─ draft       → Quote being created
├─ sent        → Quote sent to customer
└─ rejected    → Customer declined

JOBS PAGE:
├─ approved    → Customer accepted, NOT scheduled yet (UNSCHEDULED)
├─ scheduled   → Has date/time assigned
├─ in_progress → Technician working on it
└─ completed   → Work done, ready to invoice

INVOICES PAGE:
├─ invoiced    → Invoice created
└─ paid        → Customer paid
```

---

## 🎨 **UI IMPROVEMENTS:**

### **Jobs Page Filters:**
```javascript
<button onClick={() => setStatusFilter('unscheduled')}>
  Unscheduled ({jobs.filter(j => j.status === 'approved' && !j.start_time).length})
</button>

<button onClick={() => setStatusFilter('scheduled')}>
  Scheduled ({jobs.filter(j => j.start_time).length})
</button>

<button onClick={() => setStatusFilter('in_progress')}>
  In Progress ({jobs.filter(j => j.status === 'in_progress').length})
</button>

<button onClick={() => setStatusFilter('completed')}>
  Completed ({jobs.filter(j => j.status === 'completed').length})
</button>
```

### **Unscheduled Jobs Badge:**
```javascript
// Show prominent badge for unscheduled jobs
{unscheduledCount > 0 && (
  <div className="bg-orange-500 text-white px-3 py-1 rounded-full">
    {unscheduledCount} jobs need scheduling
  </div>
)}
```

---

## 🧪 **TEST SCENARIOS:**

### **Scenario A: Accept & Schedule Immediately**
1. User accepts quote
2. Clicks "Yes" to schedule
3. Smart Scheduler opens ✅
4. User schedules job
5. Job appears in Jobs page as "Scheduled" ✅

### **Scenario B: Accept & Schedule Later**
1. User accepts quote
2. Clicks "No" to schedule
3. Quote moves to Jobs page as "Unscheduled" ✅
4. User can filter Jobs by "Unscheduled" ✅
5. User clicks "Schedule" button on job
6. Smart Scheduler opens ✅
7. Job moves to "Scheduled" ✅

### **Scenario C: View Unscheduled Backlog**
1. User goes to Jobs page
2. Clicks "Unscheduled" filter
3. Sees all approved but unscheduled jobs ✅
4. Can bulk schedule or schedule individually ✅

---

## 💡 **BEST PRACTICES:**

### **When to Use Each Status:**

**approved (unscheduled):**
- ✅ Customer accepted quote
- ✅ Waiting for scheduling
- ✅ Needs date/time assignment
- ✅ Shows in "Unscheduled Jobs" backlog

**scheduled:**
- ✅ Has specific date/time
- ✅ Assigned to technician(s)
- ✅ Shows on calendar
- ✅ Customer knows when to expect service

**in_progress:**
- ✅ Technician started work
- ✅ Clock is running
- ✅ Materials being used

**completed:**
- ✅ Work is done
- ✅ Ready to invoice
- ✅ Waiting for payment

---

## 🚀 **IMPLEMENTATION PRIORITY:**

### **Phase 1: Critical (Do Now)** ⭐
1. ✅ Update Jobs page query to include `status=approved`
2. ✅ Update Quotes page query to exclude `status=approved`
3. ✅ Test: Accept quote → Click "No" → Should go to Jobs page

### **Phase 2: Important (Do Soon)**
1. Add "Unscheduled" badge/count to Jobs page header
2. Make "Unscheduled" filter default when navigating from Quotes
3. Add bulk scheduling action for unscheduled jobs

### **Phase 3: Nice to Have (Do Later)**
1. Add "Days Unscheduled" column to show aging
2. Add auto-reminders for jobs unscheduled > X days
3. Add drag-and-drop from Unscheduled to Calendar

---

## 📚 **RELATED FEATURES:**

### **Calendar Backlog:**
Your Calendar.js already has this! (Line 145-157)
```javascript
// Shows unscheduled jobs in sidebar
const loadBacklog = async () => {
  const res = await supaFetch('work_orders?status=in.(SCHEDULED,IN_PROGRESS)&select=...', ...);
  setBacklog(data);
};
```

**Should also include approved:**
```javascript
work_orders?status=in.(approved,scheduled,in_progress)
```

---

## ✅ **SUMMARY:**

**Your Question:** *"what after its accepted but they dont want it scheduled yet?"*

**Answer:** 
- ✅ It moves to **Jobs page** as **"Unscheduled"**
- ✅ Shows in **"Unscheduled Jobs"** filter
- ✅ Shows in **Calendar backlog** sidebar
- ✅ Can be scheduled anytime from Jobs page
- ❌ Does NOT stay in Quotes page

**This is the ServiceTitan/Jobber/Housecall Pro standard!** 🏆

---

**Next Step:** Update Jobs page query to include `status=approved` ✅

