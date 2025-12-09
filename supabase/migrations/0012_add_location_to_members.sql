-- Add latitude and longitude columns to members table
-- This allows storing location coordinates when a member checks in

ALTER TABLE members ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE members ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create indexes for potential geospatial queries
CREATE INDEX IF NOT EXISTS idx_members_location ON members(latitude, longitude);
