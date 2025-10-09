# Complete Enum Standardization Fix Plan

## Problem Analysis

From the CSV files, the database has UPPERCASE values in these enums:

### 1. **work_order_status_enum** (CRITICAL - Causing bugs)
- Has BOTH lowercase (lines 288-303) AND UPPERCASE (lines 304-315)
- UPPERCASE duplicates: `DRAFT`, `QUOTE`, `SENT`, `ACCEPTED`, `REJECTED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `INVOICED`, `PAID`, `CLOSED`
- **Action:** Frontend already fixed to lowercase. Database cleanup deferred to post-beta.

### 2. **pricing_model_enum** (Lines 164-168)
- Database has: `TIME_MATERIALS`, `FLAT_RATE`, `UNIT`, `PERCENTAGE`, `RECURRING`
- **These ARE intentionally UPPERCASE** (industry standard for pricing models)
- **Action:** Update frontend to match database (UPPERCASE)

### 3. **service_category_enum** (Lines 187-199)
- Database has: `HVAC`, `PLUMBING`, `ELECTRICAL`, `GENERAL_REPAIR`, etc.
- **These ARE intentionally UPPERCASE** (industry standard for service categories)
- **Action:** Update frontend to match database (UPPERCASE)

### 4. **unit_type_enum** (Lines 238-244)
- Database has: `HOUR`, `FLAT_FEE`, `SQFT`, `LINEAR_FOOT`, `UNIT`, `CUBIC_YARD`, `GALLON`
- **These ARE intentionally UPPERCASE** (industry standard for units)
- **Action:** Update frontend to match database (UPPERCASE)

### 5. **user_role_enum** (Lines 259-260)
- Mostly lowercase: `owner`, `admin`, `manager`, etc.
- BUT has 2 UPPERCASE: `APP_OWNER`, `EMPLOYEE`
- **These are MIXED intentionally** (APP_OWNER is system role, EMPLOYEE is legacy)
- **Action:** Frontend should handle both cases

### 6. **realtime.action** (Lines 316-320)
- Supabase system enum: `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `ERROR`
- **These are Supabase internals** - don't touch
- **Action:** No changes needed

## Fix Strategy

### Phase 1: Identify Frontend Files Using These Enums
Search for files that use:
- `pricing_model` or `TIME_MATERIALS`, `FLAT_RATE`
- `service_category` or `HVAC`, `PLUMBING`, `ELECTRICAL`
- `unit_type` or `HOUR`, `SQFT`
- `user_role` or `APP_OWNER`, `EMPLOYEE`

### Phase 2: Update Frontend to Match Database
For each enum type:
1. Find all frontend usages
2. Update to match database case (UPPERCASE for these specific enums)
3. Update TypeScript types
4. Update constants files
5. Update dropdowns/selects
6. Update comparisons

### Phase 3: Verification
1. Test each feature that uses these enums
2. Verify dropdowns show correct selected values
3. Verify comparisons work correctly
4. Verify API calls succeed

## Detailed Fix List

### Files to Check/Fix:

#### Pricing Model Enum (UPPERCASE in DB)
- [ ] Search for: `pricing_model`, `TIME_MATERIALS`, `FLAT_RATE`
- [ ] Update constants to UPPERCASE
- [ ] Update TypeScript types to UPPERCASE
- [ ] Update any dropdowns to UPPERCASE values

#### Service Category Enum (UPPERCASE in DB)
- [ ] Search for: `service_category`, `HVAC`, `PLUMBING`, `ELECTRICAL`
- [ ] Update constants to UPPERCASE
- [ ] Update TypeScript types to UPPERCASE
- [ ] Update any dropdowns to UPPERCASE values
- [ ] Check QuoteBuilder, CustomerPortal, Marketplace

#### Unit Type Enum (UPPERCASE in DB)
- [ ] Search for: `unit_type`, `HOUR`, `SQFT`, `LINEAR_FOOT`
- [ ] Update constants to UPPERCASE
- [ ] Update TypeScript types to UPPERCASE
- [ ] Update any dropdowns to UPPERCASE values

#### User Role Enum (MIXED case in DB)
- [ ] Search for: `user_role`, `APP_OWNER`, `EMPLOYEE`
- [ ] Ensure frontend handles both lowercase and UPPERCASE
- [ ] Update role checks to handle `APP_OWNER` and `EMPLOYEE`

## Key Principle

**Frontend MUST match database exactly!**

- If database has UPPERCASE → Frontend uses UPPERCASE
- If database has lowercase → Frontend uses lowercase
- If database has MIXED → Frontend handles both

**No assumptions, no "standards", just match the database!**

## Execution Order

1. ✅ **DONE:** work_order_status_enum (frontend uses lowercase)
2. ⏳ **TODO:** Search for pricing_model usage
3. ⏳ **TODO:** Search for service_category usage
4. ⏳ **TODO:** Search for unit_type usage
5. ⏳ **TODO:** Search for user_role usage (APP_OWNER, EMPLOYEE)
6. ⏳ **TODO:** Fix each file found
7. ⏳ **TODO:** Test each feature
8. ⏳ **TODO:** Verify no enum mismatches remain

## Success Criteria

- [ ] All dropdowns show correct selected values
- [ ] All status comparisons work correctly
- [ ] All API calls succeed (no enum constraint violations)
- [ ] No console errors about enum mismatches
- [ ] All features work end-to-end

## Post-Beta Cleanup

After beta launch, clean up database:
- Remove UPPERCASE duplicates from work_order_status_enum
- Standardize user_role_enum (decide on APP_OWNER vs app_owner)
- Document which enums are intentionally UPPERCASE vs lowercase

