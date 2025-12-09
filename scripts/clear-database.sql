-- Clear all test data from members, orientation_details, and attendance_register tables
-- Run this in Supabase SQL Editor to reset the database for testing

-- Delete in order to respect foreign key constraints
DELETE FROM attendance_register;
DELETE FROM orientation_details;
DELETE FROM members;

-- Verify tables are empty
SELECT 'attendance_register' as table_name, COUNT(*) as remaining_rows FROM attendance_register
UNION ALL
SELECT 'orientation_details' as table_name, COUNT(*) as remaining_rows FROM orientation_details
UNION ALL
SELECT 'members' as table_name, COUNT(*) as remaining_rows FROM members;
