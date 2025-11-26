-- Add is_archived column to groups table to track archived groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Add an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_groups_is_archived ON groups(is_archived);
