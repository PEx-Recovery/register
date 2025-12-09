-- Add row_id columns to members and orientation_details tables
-- These columns store the Glide Row ID for each record itself (not a reference to another table)

ALTER TABLE members ADD COLUMN IF NOT EXISTS row_id TEXT;
ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS row_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_row_id ON members(row_id);
CREATE INDEX IF NOT EXISTS idx_orientation_details_row_id ON orientation_details(row_id);
