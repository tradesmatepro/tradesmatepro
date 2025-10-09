# 🧪 **INVENTORY STOCK TESTING GUIDE**

## 🚨 **ISSUE IDENTIFIED**
The stock adjustment modal is showing but no adjustment controls are visible. This is likely because:
1. **No locations exist** in the database yet
2. **Locations not loading** properly
3. **Database triggers not installed** yet

## 🔧 **STEP-BY-STEP FIX**

### **Step 1: Install Database Triggers**
```sql
-- Run this in Supabase SQL Editor first:
-- Copy and paste the entire content from inventory_stock_triggers.sql
```

### **Step 2: Create a Location**
1. **Go to Operations → Inventory**
2. **Click "Locations" tab**
3. **Click "Add Location" button**
4. **Create a location:**
   - Name: "Main Warehouse"
   - Address: (optional)
   - Check "Default Location" if available
5. **Save the location**

### **Step 3: Test Stock Adjustment**
1. **Go back to "Items" tab**
2. **Click "Stock" button** on any item
3. **You should now see:**
   - Location name (Main Warehouse)
   - Current quantity (probably 0)
   - Adjustment controls (+/- buttons and input field)
   - Quick adjustment buttons (+1, +10, -1, -10)

### **Step 4: Add Stock**
1. **Click "+10" button** to add 10 units
2. **Or type "25"** in the input field
3. **See "Total Adjustment"** update
4. **Click "Save Adjustments"**
5. **Check that quantity updates** in the item card

## 🐛 **DEBUGGING STEPS**

### **Check Browser Console**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for these messages:**
   - "Locations loaded: [...]"
   - "Stock data loaded: [...]"
   - "No locations found, creating default location..."
   - "Default location created: [...]"

### **If No Locations Load**
The modal will automatically try to create a "Main Warehouse" location. If this fails:
1. **Manually create location** in Locations tab first
2. **Check Supabase logs** for errors
3. **Verify company_id** is correct

### **If Adjustments Don't Save**
1. **Check browser console** for errors
2. **Verify database triggers** are installed
3. **Check Supabase logs** for movement creation errors

## 🎯 **EXPECTED BEHAVIOR**

### **Working Stock Adjustment Modal:**
```
Adjust Stock
Test Item

┌─────────────────────────────────────┐
│ Main Warehouse                      │
│ Current: 0 each                     │
│                                     │
│ [-10] [-] [___5___] [+] [+10]      │
│                                     │
│ New: 5 each                         │
│ +5                                  │
└─────────────────────────────────────┘

Total Adjustment: +5 each

[Cancel] [Save Adjustments]
```

### **After Saving:**
- **Movement created** in Movements tab
- **Stock quantity updated** in Items tab
- **Inventory alerts** recalculated
- **Quote creation** shows new quantities

## 🚀 **QUICK TEST SEQUENCE**

1. **Create location** if none exist
2. **Open stock adjustment** modal
3. **Add 10 units** using +10 button
4. **Save adjustments**
5. **Verify quantity** shows 10 in item card
6. **Check Movements tab** for adjustment record
7. **Try quote creation** - should show 10 available

## 🔍 **TROUBLESHOOTING**

### **Modal Shows But No Controls**
- **Missing locations** - Create one in Locations tab
- **JavaScript errors** - Check browser console
- **API errors** - Check network tab in dev tools

### **Adjustments Don't Save**
- **Database triggers missing** - Install inventory_stock_triggers.sql
- **Permission errors** - Check Supabase RLS policies
- **Network errors** - Check API responses

### **Quantities Still Show 0**
- **Triggers not working** - Run recalculate_inventory_stock()
- **Wrong location** - Check location_id in movements
- **Cache issues** - Refresh page

## ✅ **SUCCESS INDICATORS**

- **✅ Modal shows location(s)**
- **✅ Adjustment controls visible**
- **✅ Total adjustment updates**
- **✅ Save button works**
- **✅ Quantities update in UI**
- **✅ Movements recorded**
- **✅ Quotes show real quantities**

**Once this works, your inventory system will have full stock management! 🎉**
