-- Add reason_for_attending column to members table
-- This allows us to store the user's reason for attending in the members table for easy access

ALTER TABLE members ADD COLUMN IF NOT EXISTS reason_for_attending TEXT;
