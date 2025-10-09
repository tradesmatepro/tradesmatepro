# 🛠️ MARKETPLACE SCHEMA FIXES NEEDED

**Date:** 2025-09-22  
**Issue:** Frontend marketplace functionality expects fields/tables that don't exist in database  

---

## 🚨 **MISSING FIELDS IN EXISTING TABLES**

### **1. `marketplace_requests` table missing fields:**

**Currently has:**
- id, company_id, customer_id, title, description, status, budget, location, created_at, updated_at

**Frontend expects (missing):**
- `request_type` - TEXT field for categorizing request types (e.g., 'plumbing', 'electrical', 'hvac')
- `pricing_preference` - TEXT field for pricing preferences (e.g., 'hourly', 'fixed', 'estimate')

**SQL to add missing fields:**
```sql
ALTER TABLE marketplace_requests 
ADD COLUMN request_type TEXT,
ADD COLUMN pricing_preference TEXT;
```

---

## 🚨 **MISSING TABLE RELATIONSHIPS**

### **2. `tags` table missing (referenced by `request_tags`):**

**Current situation:**
- `request_tags` table exists with fields: id, request_id, tag (TEXT)
- Frontend expects: `request_tags(tags(name))` - a foreign key relationship

**Two options:**

#### **Option A: Create `tags` table + foreign key (Recommended)**
```sql
-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modify request_tags to use foreign key
ALTER TABLE request_tags 
DROP COLUMN tag,
ADD COLUMN tag_id UUID REFERENCES tags(id) ON DELETE CASCADE;

-- Populate tags table with existing data
INSERT INTO tags (name) 
SELECT DISTINCT tag FROM request_tags WHERE tag IS NOT NULL;

-- Update request_tags with proper foreign keys
UPDATE request_tags 
SET tag_id = (SELECT id FROM tags WHERE tags.name = request_tags.tag);
```

#### **Option B: Fix frontend query (Simpler)**
```javascript
// Change from:
request_tags (tags (name))

// To:
request_tags (tag)
```

---

## 🎯 **RECOMMENDED APPROACH**

### **For Beta Launch (Quick Fix):**
1. **Add missing fields to marketplace_requests:**
   ```sql
   ALTER TABLE marketplace_requests 
   ADD COLUMN request_type TEXT,
   ADD COLUMN pricing_preference TEXT;
   ```

2. **Fix frontend query for tags:**
   - Update MarketplaceService.js to use `request_tags(tag)` instead of `request_tags(tags(name))`

### **For Production (Proper Schema):**
1. **Create proper tags table with foreign key relationship**
2. **Add enums for request_type and pricing_preference**
3. **Add proper indexes and constraints**

---

## 📋 **CURRENT ERRORS TO FIX**

### **Error 1: Missing Fields**
```
column marketplace_requests_1.request_type does not exist
column marketplace_requests_1.pricing_preference does not exist
```

### **Error 2: Missing Relationship**
```
Could not find a relationship between 'request_tags' and 'tags' in the schema cache
```

---

## 🚀 **IMMEDIATE ACTION PLAN**

1. **Add missing fields to database:**
   ```sql
   ALTER TABLE marketplace_requests 
   ADD COLUMN request_type TEXT,
   ADD COLUMN pricing_preference TEXT;
   ```

2. **Fix tags relationship in frontend:**
   - Update query from `request_tags(tags(name))` to `request_tags(tag)`
   - Update frontend code to handle the simpler structure

3. **Test marketplace functionality**

---

## 💡 **FUTURE ENHANCEMENTS**

Once basic functionality works:
- Create proper `tags` table with foreign key relationships
- Add enums for `request_type` and `pricing_preference` 
- Add validation and constraints
- Add indexes for performance

**The marketplace functionality is designed correctly - we just need to align the database schema with the frontend expectations!**
