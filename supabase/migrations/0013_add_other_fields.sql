-- Add problematic_substances_other column to orientation_details table
-- This stores the user's custom input when they select "Other" for problematic substances

ALTER TABLE orientation_details ADD COLUMN IF NOT EXISTS problematic_substances_other TEXT;
