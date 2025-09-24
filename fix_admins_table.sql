-- Fix admins table by adding required fields
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Add missing columns to admins table (avoiding reserved keywords)
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS plain_password TEXT;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admins_mobile ON admins(mobile);
CREATE INDEX IF NOT EXISTS idx_admins_job_title ON admins(job_title);

-- Step 3: Update any existing admin records to have default values
UPDATE admins SET
  job_title = COALESCE(job_title, 'Administrator'),
  status = COALESCE(status, 'Active')
WHERE job_title IS NULL OR status IS NULL;