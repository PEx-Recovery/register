-- Add row linking columns for Glide integration
-- This migration adds columns to link records across tables using row IDs

-- ============================================================================
-- Members table: Add links to orientation and group records
-- ============================================================================
ALTER TABLE members ADD COLUMN IF NOT EXISTS orientation_row_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS group_row_id TEXT;

-- ============================================================================
-- Orientation_details table: Add links to member and group, plus email and location
-- ============================================================================
ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS member_row_id TEXT;
ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS group_row_id TEXT;
ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- ============================================================================
-- Attendance_register table: Add links to member and group
-- ============================================================================
ALTER TABLE attendance_register ADD COLUMN IF NOT EXISTS member_row_id TEXT;
ALTER TABLE attendance_register ADD COLUMN IF NOT EXISTS group_row_id TEXT;

-- ============================================================================
-- Create indexes for performance on the new linking columns
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_members_orientation_row_id ON members(orientation_row_id);
CREATE INDEX IF NOT EXISTS idx_members_group_row_id ON members(group_row_id);
CREATE INDEX IF NOT EXISTS idx_orientation_member_row_id ON orientation_details(member_row_id);
CREATE INDEX IF NOT EXISTS idx_orientation_group_row_id ON orientation_details(group_row_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_row_id ON attendance_register(member_row_id);
CREATE INDEX IF NOT EXISTS idx_attendance_group_row_id ON attendance_register(group_row_id);
