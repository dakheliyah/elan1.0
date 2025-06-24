# Function Overloading Fix for create_publications_for_all_locations

## Problem Summary

The application was experiencing a `PGRST203` error due to function overloading conflicts with `create_publications_for_all_locations`. PostgreSQL could not choose between multiple function signatures:

1. `create_publications_for_all_locations(p_title => text, p_event_id => uuid, p_publication_date => date, p_status => public.publication_status, p_created_by => uuid)`
2. `create_publications_for_all_locations(p_title => text, p_event_id => uuid, p_publication_date => date, p_status => text, p_created_by => uuid)`

## Root Cause

The issue was caused by multiple migration files creating different versions of the same function:

- **20250123000000-separate-location-publications.sql**: Created function with `p_status TEXT` and `p_is_featured BOOLEAN`
- **20250123000001-remove-featured-publication-functionality.sql**: Attempted to replace with `p_status publication_status` (without `p_is_featured`)
- **20250126000000-fix-function-overloading.sql**: Attempted to fix by dropping and recreating

The problem was that `CREATE OR REPLACE FUNCTION` doesn't work when parameter types differ - it creates overloaded functions instead.

## Solution Implemented

### 1. Created Definitive Migration

**File**: `supabase/migrations/20250127000000-resolve-function-overloading-final.sql`

- Explicitly drops ALL possible function signature variations
- Creates single authoritative function with `publication_status` enum type
- Removes deprecated `p_is_featured` parameter
- Includes proper GRANT permissions

### 2. Updated Existing Migrations

- **20250123000000-separate-location-publications.sql**: Removed function definition, added reference note
- **20250123000001-remove-featured-publication-functionality.sql**: Removed function definition, added reference note
- **20250126000000-fix-function-overloading.sql**: Deleted (was causing conflicts)

### 3. Verified TypeScript Types

- **src/integrations/supabase/types.ts**: Confirmed correct function signature
- **src/services/publicationsService.ts**: Verified correct usage

## Final Function Signature

```sql
CREATE FUNCTION create_publications_for_all_locations(
  p_title TEXT,
  p_event_id UUID,
  p_publication_date DATE,
  p_status publication_status DEFAULT 'draft',
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE(
  publication_id UUID,
  location_id UUID,
  location_name TEXT
)
```

## How to Apply the Fix

### Option 1: Database Reset (Recommended)

```bash
# Ensure Docker Desktop is running
npx supabase db reset
```

### Option 2: Manual Migration

```bash
# Apply the new migration
npx supabase db push
```

### Option 3: Direct SQL (If needed)

If migrations fail, you can manually execute the SQL from `20250127000000-resolve-function-overloading-final.sql` in your database.

## Verification

After applying the fix:

1. **Check function exists**:
   ```sql
   SELECT proname, proargtypes 
   FROM pg_proc 
   WHERE proname = 'create_publications_for_all_locations';
   ```
   Should return only ONE row.

2. **Test function call**:
   ```sql
   SELECT * FROM create_publications_for_all_locations(
     'Test Publication',
     'your-event-id',
     '2025-01-27',
     'draft',
     'your-user-id'
   );
   ```

3. **Test from application**: Try creating a publication through the UI.

## Prevention

To prevent similar issues in the future:

1. **Always use explicit DROP before CREATE** when changing function signatures
2. **Use exact parameter types** in DROP statements
3. **Avoid CREATE OR REPLACE** when parameter types change
4. **Test migrations** in development before applying to production

## Files Modified

- ✅ `supabase/migrations/20250127000000-resolve-function-overloading-final.sql` (created)
- ✅ `supabase/migrations/20250123000000-separate-location-publications.sql` (updated)
- ✅ `supabase/migrations/20250123000001-remove-featured-publication-functionality.sql` (updated)
- ✅ `supabase/migrations/20250126000000-fix-function-overloading.sql` (deleted)

## Status

🟢 **READY TO APPLY** - All conflicts resolved, single function definition established.