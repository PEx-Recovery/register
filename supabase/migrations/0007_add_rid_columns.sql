-- Add RID columns to groups table
-- row_id: The unique identifier from the CSV (🔒 Row ID column)
-- affiliate_rid: The affiliate reference ID from the CSV (Affiliate/RID column)

ALTER TABLE groups ADD COLUMN IF NOT EXISTS row_id TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS affiliate_rid TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_groups_row_id ON groups(row_id);
CREATE INDEX IF NOT EXISTS idx_groups_affiliate_rid ON groups(affiliate_rid);
