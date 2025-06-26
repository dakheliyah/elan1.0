-- Create location access level enum
CREATE TYPE location_access_level AS ENUM ('read', 'write', 'admin');

-- Create user_location_access table
CREATE TABLE user_location_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    access_level location_access_level NOT NULL DEFAULT 'read',
    granted_by UUID NOT NULL REFERENCES profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user-location pairs
    UNIQUE(user_id, location_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_location_access_user_id ON user_location_access(user_id);
CREATE INDEX idx_user_location_access_location_id ON user_location_access(location_id);
CREATE INDEX idx_user_location_access_access_level ON user_location_access(access_level);
CREATE INDEX idx_user_location_access_expires_at ON user_location_access(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS on user_location_access table
ALTER TABLE user_location_access ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own access records
CREATE POLICY "Users can view their own location access" ON user_location_access
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all access records for locations they admin
CREATE POLICY "Admins can view location access for their locations" ON user_location_access
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_location_access ula
            WHERE ula.user_id = auth.uid()
            AND ula.location_id = user_location_access.location_id
            AND ula.access_level = 'admin'
        )
    );

-- RLS Policy: Location admins can manage access for their locations
CREATE POLICY "Location admins can manage access" ON user_location_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_location_access ula
            WHERE ula.user_id = auth.uid()
            AND ula.location_id = user_location_access.location_id
            AND ula.access_level = 'admin'
        )
    );

-- RLS Policy: Global admins can manage all access
CREATE POLICY "Global admins can manage all location access" ON user_location_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Function to automatically grant admin access to location creator
CREATE OR REPLACE FUNCTION grant_location_creator_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Grant admin access to the location creator
    INSERT INTO user_location_access (user_id, location_id, access_level, granted_by)
    VALUES (NEW.created_by, NEW.id, 'admin', NEW.created_by)
    ON CONFLICT (user_id, location_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically grant access when location is created
CREATE TRIGGER trigger_grant_location_creator_access
    AFTER INSERT ON locations
    FOR EACH ROW
    EXECUTE FUNCTION grant_location_creator_access();

-- Grant existing users admin access to all existing locations
-- This ensures backward compatibility
INSERT INTO user_location_access (user_id, location_id, access_level, granted_by)
SELECT 
    p.id as user_id,
    l.id as location_id,
    'admin' as access_level,
    COALESCE(l.created_by, p.id) as granted_by
FROM profiles p
CROSS JOIN locations l
WHERE p.role IN ('admin', 'editor')
ON CONFLICT (user_id, location_id) DO NOTHING;

-- Add updated_at trigger for user_location_access
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_location_access_updated_at
    BEFORE UPDATE ON user_location_access
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add created_by column to locations table if it doesn't exist
-- (This might already exist based on the schema we saw)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'locations' AND column_name = 'created_by') THEN
        ALTER TABLE locations ADD COLUMN created_by UUID REFERENCES profiles(id);
        
        -- Set created_by for existing locations to the first admin user
        -- If no admin exists, use the first available user
        UPDATE locations SET created_by = (
            SELECT id FROM profiles 
            WHERE role = 'admin' 
            ORDER BY created_at ASC 
            LIMIT 1
        ) WHERE created_by IS NULL;
        
        -- If still no admin found, use any user
        UPDATE locations SET created_by = (
            SELECT id FROM profiles 
            ORDER BY created_at ASC 
            LIMIT 1
        ) WHERE created_by IS NULL;
        
        -- Make created_by NOT NULL after setting values
        ALTER TABLE locations ALTER COLUMN created_by SET NOT NULL;
    END IF;
END $$;