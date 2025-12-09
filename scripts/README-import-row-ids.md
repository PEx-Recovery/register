# Glide Row ID Import Script

## Overview
This script imports Glide Row IDs from your CSV file into the Supabase `groups` table. It matches groups by name and updates the `row_id` and `affiliate_rid` columns.

## Prerequisites
- CSV file must be at project root: `BRI Groups List v2.csv`
- Environment variables must be set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Running the Import

```bash
npm run import-row-ids
```

## What It Does

1. **Reads CSV**: Loads group data from `BRI Groups List v2.csv`
2. **Fetches Supabase Groups**: Gets all existing groups from your database
3. **Matches by Name**: Finds matching groups using case-insensitive name comparison
4. **Updates Database**: Updates `row_id` and `affiliate_rid` for matched groups
5. **Reports Results**: Shows summary of matches, updates, and unmatched groups

## Output

The script will display:
- Total groups found in CSV and Supabase
- Number of groups updated
- Number of groups that already had Row IDs (skipped)
- List of unmatched groups (in CSV but not in Supabase)
- List of Supabase groups without Row IDs

## Safety Features

- **Skip if already populated**: Won't overwrite existing `row_id` values
- **Service role key**: Uses service role to bypass RLS policies
- **Detailed logging**: Shows exactly what's being updated

## After Import

Once the import is complete:
1. Verify the Row IDs in Supabase Studio
2. Glide will automatically sync any new groups or updates
3. The `row_id` column will be maintained by Glide's sync mechanism

## Troubleshooting

**Error: Cannot find module 'csv-parser'**
- Run: `npm install`

**Error: Missing environment variables**
- Check that `.env.local` has the required Supabase credentials

**Many unmatched groups**
- Check for differences in group names between CSV and Supabase
- Manual updates may be needed for groups with different names
