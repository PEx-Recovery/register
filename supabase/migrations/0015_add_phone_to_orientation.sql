-- Add phone column to orientation_details table
-- This stores the member's phone number in the orientation details for easy access

ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS phone TEXT;
