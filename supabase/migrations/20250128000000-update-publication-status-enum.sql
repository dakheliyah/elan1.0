-- Migration to update publication_status enum from 'published' to 'mark_as_ready'

-- Step 1: Add the new enum value 'mark_as_ready'
ALTER TYPE publication_status ADD VALUE 'mark_as_ready';

-- Step 2: Update all existing 'published' records to 'mark_as_ready'
UPDATE publications 
SET status = 'mark_as_ready' 
WHERE status = 'published';

-- Step 3: Create a new enum type without 'published'
CREATE TYPE publication_status_new AS ENUM ('draft', 'mark_as_ready', 'archived');

-- Step 4: Update the publications table to use the new enum
ALTER TABLE publications 
ALTER COLUMN status TYPE publication_status_new 
USING status::text::publication_status_new;

-- Step 5: Drop the old enum and rename the new one
DROP TYPE publication_status;
ALTER TYPE publication_status_new RENAME TO publication_status;

-- Verify the change
-- SELECT DISTINCT status FROM publications;
-- SELECT unnest(enum_range(NULL::publication_status)) AS status_values;