# 🔍 Schema Introspection System - AI Integration Guide

## 🎯 Purpose

This system allows Claude (and other AI assistants) to **see** your actual database schema without asking you to manually run SQL commands.

## ✅ What This Fixes

### **Before (Broken):**
```
Claude: "Can you run this SQL in Supabase and paste the results?"
You: *manually runs SQL, copies output, pastes*
Claude: "Thanks! Now run this other SQL..."
You: *repeats 10 more times*
```

### **After (Fixed):**
```
Claude: *runs* node deploy-enhanced.js --pull-schema
Claude: *reads* schema_dumps/schema_dump.json
Claude: "I can see you have 47 tables. Let me fix the issue..."
```

## 🚀 How To Use

### **Command 1: Pull Current Schema**

```bash
node deploy-enhanced.js --pull-schema
```

**What it does:**
- Connects to your Supabase database
- Extracts ALL tables, columns, enums, foreign keys
- Gets row counts for each table
- Saves to `schema_dumps/schema_dump.json` (for AI)
- Saves to `schema_dumps/SCHEMA_CURRENT.md` (for humans)

**When to use:**
- Before starting any schema work
- After making manual changes in Supabase
- When Claude asks "what tables exist?"
- When debugging schema issues

### **Command 2: Deploy with Auto-Pull**

```bash
node deploy-enhanced.js --phase=1 --pull-after
```

**What it does:**
- Deploys phase 1 schema
- Automatically pulls schema after deployment
- Updates schema_dump.json with latest state

**When to use:**
- After deploying new schema changes
- To keep schema dumps in sync

## 📁 Output Files

### **schema_dumps/schema_dump.json**
```json
{
  "metadata": {
    "timestamp": "2025-09-30T...",
    "database": "postgres",
    "host": "aws-1-us-west-1.pooler.supabase.com"
  },
  "tables": [
    {
      "table_name": "company_settings",
      "columns": [
        {
          "column_name": "id",
          "data_type": "uuid",
          "is_nullable": "NO",
          "column_default": "gen_random_uuid()"
        },
        {
          "column_name": "labor_rate",
          "data_type": "numeric",
          "is_nullable": "YES",
          "column_default": "75.00"
        }
      ]
    }
  ],
  "enums": [
    {
      "enum_name": "user_role_enum",
      "values": ["OWNER", "ADMIN", "EMPLOYEE"]
    }
  ],
  "row_counts": [
    {
      "table_name": "company_settings",
      "row_count": 3
    }
  ]
}
```

### **schema_dumps/SCHEMA_CURRENT.md**
Human-readable markdown with:
- Table list with row counts
- Column details for each table
- Enum definitions
- Foreign key relationships

## 🤖 How Claude Uses This

### **Step 1: Check Current State**
```javascript
// Claude reads schema_dump.json
const schema = JSON.parse(fs.readFileSync('schema_dumps/schema_dump.json'));

// Claude can now see:
console.log(`Found ${schema.tables.length} tables`);
console.log(`company_settings has ${schema.tables.find(t => t.table_name === 'company_settings').columns.length} columns`);
```

### **Step 2: Identify Issues**
```javascript
// Claude checks if columns exist
const companySettings = schema.tables.find(t => t.table_name === 'company_settings');
const hasLaborRate = companySettings.columns.some(c => c.column_name === 'labor_rate');

if (!hasLaborRate) {
  console.log('❌ Missing labor_rate column - need to add it');
}
```

### **Step 3: Create Fix**
```javascript
// Claude creates migration SQL
const migration = `
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS labor_rate NUMERIC(10,2) DEFAULT 75.00;
`;

// Claude saves to deploy/migrations/add-labor-rate.sql
fs.writeFileSync('deploy/migrations/add-labor-rate.sql', migration);
```

### **Step 4: Deploy & Verify**
```bash
# Claude runs deployment
node deploy-enhanced.js --sql=deploy/migrations/add-labor-rate.sql

# Claude pulls updated schema
node deploy-enhanced.js --pull-schema

# Claude verifies fix
const updatedSchema = JSON.parse(fs.readFileSync('schema_dumps/schema_dump.json'));
const nowHasLaborRate = updatedSchema.tables
  .find(t => t.table_name === 'company_settings')
  .columns.some(c => c.column_name === 'labor_rate');

console.log(nowHasLaborRate ? '✅ Fixed!' : '❌ Still broken');
```

## 🔄 Workflow Integration

### **For Schema Changes:**
```bash
# 1. Pull current state
node deploy-enhanced.js --pull-schema

# 2. Claude analyzes schema_dump.json
# 3. Claude creates migration SQL
# 4. Deploy changes
node deploy-enhanced.js --sql=deploy/migrations/my-fix.sql

# 5. Pull updated state
node deploy-enhanced.js --pull-schema

# 6. Claude verifies changes
```

### **For Debugging:**
```bash
# 1. Pull current state
node deploy-enhanced.js --pull-schema

# 2. Claude reads SCHEMA_CURRENT.md
# 3. Claude identifies mismatch between code and schema
# 4. Claude proposes fix
# 5. You approve
# 6. Claude deploys fix
```

## 📊 What Gets Captured

### **Tables:**
- Table name
- All columns (name, type, nullable, default)
- Row count (how much data exists)

### **Enums:**
- Enum name
- All possible values

### **Constraints:**
- Foreign keys
- Which tables reference which

### **Metadata:**
- When schema was pulled
- Which database
- Which host

## 🎯 Benefits

### **For You:**
- ✅ No more manual SQL copy/paste
- ✅ No more "run this and tell me what you see"
- ✅ Faster debugging
- ✅ Always up-to-date schema docs

### **For Claude:**
- ✅ Can see actual database state
- ✅ Can verify changes were applied
- ✅ Can detect schema drift
- ✅ Can propose accurate fixes

### **For The Project:**
- ✅ Schema documentation always current
- ✅ Audit trail of schema changes
- ✅ Easy to compare locked schema vs reality
- ✅ Foundation for automated testing

## 🚨 Important Notes

### **When to Pull Schema:**
- Before starting any schema work
- After manual changes in Supabase dashboard
- After running migrations
- When debugging schema issues
- When Claude asks about database structure

### **What Gets Stored:**
- `schema_dumps/schema_dump.json` - Latest pull (AI reads this)
- `schema_dumps/SCHEMA_CURRENT.md` - Latest pull (humans read this)
- `logs/deploy-*.json` - Deployment history

### **Git Considerations:**
- ✅ Commit `schema_dumps/SCHEMA_CURRENT.md` (documentation)
- ❌ Don't commit `schema_dumps/schema_dump.json` (too noisy)
- ✅ Add to .gitignore: `schema_dumps/schema_dump.json`

## 🔧 Troubleshooting

### **"Connection failed"**
- Check .env has correct Supabase credentials
- Check network connection
- Try: `node deploy-enhanced.js --test-connection`

### **"Permission denied"**
- Database user needs SELECT permissions
- Check DB_USER in .env is correct
- Try: `node deploy-enhanced.js --verify-credentials`

### **"Schema dump is empty"**
- Check database actually has tables
- Check you're connecting to right database
- Check DB_NAME in .env

### **"Schema dump is outdated"**
- Run: `node deploy-enhanced.js --pull-schema`
- Check timestamp in schema_dump.json
- Should be recent (within last hour)

## 📝 Next Steps

1. **Run initial pull:**
   ```bash
   node deploy-enhanced.js --pull-schema
   ```

2. **Check output:**
   - Open `schema_dumps/SCHEMA_CURRENT.md`
   - Verify it shows your tables

3. **Compare to locked schema:**
   - Open `APP Schemas/Locked/MASTER_DATABASE_SCHEMA_LOCKED.md`
   - Compare to `SCHEMA_CURRENT.md`
   - Identify differences

4. **Let Claude analyze:**
   - Claude reads both files
   - Claude identifies schema drift
   - Claude proposes fixes

5. **Deploy fixes:**
   - Claude creates migration SQL
   - You approve
   - Claude deploys
   - Claude pulls updated schema
   - Claude verifies fix

---

**This is how Claude gets visibility into your database without asking you to manually run SQL!** 🎉

