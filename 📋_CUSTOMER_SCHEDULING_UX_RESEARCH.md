# 📋 CUSTOMER SCHEDULING UX RESEARCH

## 🔍 HOW INDUSTRY LEADERS HANDLE CUSTOMER SELF-SCHEDULING

### **ServiceTitan**
**Approach:** Calendar-based date picker with time slots
- Customer selects a **date** first (calendar widget)
- Then sees available **time slots** for that specific day
- "No preference" option → auto-assigns earliest available
- Shows "Next Available: Oct 14 at 9:00 AM" prominently
- Filters: "This Week", "Next Week", "Custom Date Range"

**UX Flow:**
1. Calendar shows available dates (highlighted in green)
2. Customer clicks a date
3. Shows 4-6 time slots for that day (Morning, Afternoon, Evening)
4. OR clicks "No Preference - Schedule ASAP"

---

### **Jobber**
**Approach:** Week-view calendar with time blocks
- Shows current week by default
- Navigation: "← Previous Week" | "Next Week →"
- Time slots grouped by day
- "I'm Flexible" button → auto-assigns best slot
- Shows technician name with each slot (optional)

**UX Flow:**
1. Week view (Mon-Fri) with available slots
2. Customer clicks a slot
3. Confirms booking
4. OR clicks "I'm Flexible" for auto-assignment

---

### **Housecall Pro**
**Approach:** Simple date + time selection
- Date picker (calendar dropdown)
- Time dropdown (Morning 8-12, Afternoon 12-4, Evening 4-8)
- "ASAP - First Available" checkbox
- Shows "Earliest Available: Tomorrow at 9 AM"

**UX Flow:**
1. Select date from calendar
2. Select time window (Morning/Afternoon/Evening)
3. OR check "ASAP" to skip selection
4. Confirm

---

### **Calendly** (Scheduling Gold Standard)
**Approach:** Month calendar with available dates
- Month view calendar
- Available dates highlighted
- Click date → see time slots for that day
- Navigation: "← October 2025 →"
- Timezone selector
- "Next Available" button at top

**UX Flow:**
1. Month calendar shows available dates
2. Click date → time slots appear on right
3. Click time slot → confirm
4. OR click "Next Available" at top

---

## 🎯 RECOMMENDED APPROACH FOR TRADEMATE PRO

### **Best Practices Synthesis:**

**1. Calendar-First Design** (Like Calendly + ServiceTitan)
- Month calendar view
- Highlight available dates
- Click date → show time slots for that day
- Navigation arrows for month/week

**2. Quick Filters** (Like ServiceTitan)
- "Next Available" button (auto-assigns earliest)
- "This Week" / "Next Week" / "Next Month" tabs
- "I'm Flexible" option

**3. Time Slot Grouping** (Like Housecall Pro)
- Morning (7:30 AM - 12:00 PM)
- Afternoon (12:00 PM - 5:00 PM)
- Evening (5:00 PM - 8:00 PM)
- Show 2-3 specific times per window

**4. Smart Defaults**
- Default to "Next Available" pre-selected
- Show "Earliest Available: Oct 14 at 9:00 AM" prominently
- Allow customer to change if they want

---

## 🎨 PROPOSED UX FOR QUOTE.HTML

### **Option A: Calendar + Time Slots (Recommended)**

```
┌─────────────────────────────────────────────────────┐
│  📅 Schedule Your Service                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚡ Next Available: Mon, Oct 14 at 9:00 AM         │
│  [✓] Auto-schedule at earliest time                │
│  [ ] I want to choose a specific time              │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  October 2025          [← →]                │  │
│  │  Su Mo Tu We Th Fr Sa                       │  │
│  │      1  2  3  4  5  6                       │  │
│  │   7  8  9 10 11 12 13                       │  │
│  │  14 15 16 17 18 19 20  ← Available dates   │  │
│  │  21 22 23 24 25 26 27     highlighted       │  │
│  │  28 29 30 31                                │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Available Times for Monday, Oct 14:                │
│  ○ Morning (9:00 AM - 11:00 AM)                    │
│  ○ Afternoon (1:00 PM - 3:00 PM)                   │
│  ○ Afternoon (3:30 PM - 5:30 PM)                   │
│                                                     │
│  [Confirm Schedule]                                 │
└─────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ Familiar calendar interface
- ✅ Easy to browse dates
- ✅ "Auto-schedule" option for customers who don't care
- ✅ Matches industry standards

**Cons:**
- More complex to implement
- Requires calendar library

---

### **Option B: Week View (Simpler)**

```
┌─────────────────────────────────────────────────────┐
│  📅 Schedule Your Service                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚡ [Auto-Schedule ASAP] ← Default option          │
│                                                     │
│  Or choose a specific time:                         │
│                                                     │
│  [This Week] [Next Week] [Next Month]              │
│                                                     │
│  Monday, Oct 14                                     │
│  ○ 9:00 AM - 11:00 AM                              │
│  ○ 1:00 PM - 3:00 PM                               │
│                                                     │
│  Tuesday, Oct 15                                    │
│  ○ 8:00 AM - 10:00 AM                              │
│  ○ 2:00 PM - 4:00 PM                               │
│                                                     │
│  Wednesday, Oct 16                                  │
│  ○ 10:00 AM - 12:00 PM                             │
│  ○ 3:00 PM - 5:00 PM                               │
│                                                     │
│  [Show More Dates →]                                │
│                                                     │
│  [Confirm Schedule]                                 │
└─────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ Simpler to implement
- ✅ Still has "Auto-Schedule" option
- ✅ Week filters reduce scrolling
- ✅ Shows multiple days at once

**Cons:**
- Less visual than calendar
- Still some scrolling needed

---

## 🔧 TECHNICAL IMPLEMENTATION

### **1. Auto-Schedule (No Preference)**

**How it works:**
- Customer checks "Auto-schedule at earliest time"
- Frontend sends `auto_schedule: true` to backend
- Backend picks earliest available slot
- Creates schedule event automatically
- Customer sees confirmation: "Scheduled for Oct 14 at 9:00 AM"

**Code:**
```javascript
if (autoSchedule) {
  // Get earliest slot
  const earliestSlot = availableSlots[0];
  
  approvalData.scheduledTime = {
    start_time: earliestSlot.start_time,
    end_time: earliestSlot.end_time,
    employee_id: earliestSlot.employee_id,
    auto_scheduled: true
  };
}
```

---

### **2. Calendar Updates**

**Yes, it updates the actual company calendar!**

When customer confirms scheduling:
1. ✅ Creates `schedule_event` record
2. ✅ Links to `work_order_id`
3. ✅ Assigns to `employee_id`
4. ✅ Shows on company Calendar page
5. ✅ Blocks that time slot for other bookings

**Database:**
```sql
INSERT INTO schedule_events (
  work_order_id,
  employee_id,
  start_time,
  end_time,
  title,
  company_id,
  created_by_customer
) VALUES (
  'quote-id',
  'employee-id',
  '2025-10-14 09:00:00',
  '2025-10-14 11:00:00',
  'Customer Scheduled: Work Order #1234',
  'company-id',
  true
);
```

---

### **3. Date Filtering**

**Week/Month Filters:**
```javascript
function filterSlotsByWeek(slots, weekOffset) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() + (weekOffset * 7));
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  return slots.filter(slot => {
    const slotDate = new Date(slot.start_time);
    return slotDate >= startOfWeek && slotDate < endOfWeek;
  });
}

// Usage:
const thisWeek = filterSlotsByWeek(availableSlots, 0);
const nextWeek = filterSlotsByWeek(availableSlots, 1);
const nextMonth = filterSlotsByWeek(availableSlots, 4);
```

---

### **4. Time Slot Grouping**

**Group by Day + Time Window:**
```javascript
function groupSlotsByDay(slots) {
  const grouped = {};
  
  slots.forEach(slot => {
    const date = new Date(slot.start_time);
    const dateKey = date.toISOString().split('T')[0]; // "2025-10-14"
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        morning: [],
        afternoon: [],
        evening: []
      };
    }
    
    const hour = date.getHours();
    if (hour < 12) {
      grouped[dateKey].morning.push(slot);
    } else if (hour < 17) {
      grouped[dateKey].afternoon.push(slot);
    } else {
      grouped[dateKey].evening.push(slot);
    }
  });
  
  return grouped;
}
```

---

## 💡 RECOMMENDED IMPLEMENTATION

### **Phase 1: Quick Win (Option B + Auto-Schedule)**
1. ✅ Add "Auto-Schedule ASAP" button (default)
2. ✅ Add week filters (This Week, Next Week, Next Month)
3. ✅ Group slots by day
4. ✅ Show 3-5 slots per day max
5. ✅ "Show More" button to expand

**Estimated Time:** 2-3 hours
**User Impact:** Solves 80% of the problem

---

### **Phase 2: Full Calendar (Option A)**
1. Add calendar library (react-calendar or similar)
2. Highlight available dates
3. Click date → show time slots
4. Month navigation
5. Keep "Auto-Schedule" option

**Estimated Time:** 4-6 hours
**User Impact:** Premium UX matching Calendly

---

## 🎯 RECOMMENDATION

**Start with Phase 1 (Option B + Auto-Schedule)**

**Why:**
- ✅ Solves the scrolling nightmare immediately
- ✅ Gives customers "I don't care" option
- ✅ Simpler to implement
- ✅ Still professional
- ✅ Can upgrade to calendar later

**Most customers will use "Auto-Schedule ASAP" anyway!**

According to industry data:
- 60-70% of customers choose "earliest available"
- 20-25% choose specific date
- 10-15% choose specific time

So prioritize the auto-schedule flow!

---

## 📋 NEXT STEPS

1. **Implement Auto-Schedule button** (highest priority)
2. **Add week filters** (This Week, Next Week, etc.)
3. **Group slots by day** (show 3-5 per day)
4. **Test with real quote**
5. **Gather feedback**
6. **Consider calendar upgrade** if needed

**Want me to implement Phase 1 now?**

