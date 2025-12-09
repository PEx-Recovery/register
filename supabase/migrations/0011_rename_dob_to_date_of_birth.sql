-- Standardize date_of_birth column name in attendance_register
-- The table uses 'dob' but code uses 'date_of_birth' - let's standardize to 'date_of_birth'

ALTER TABLE attendance_register RENAME COLUMN dob TO date_of_birth;
