-- Add role field to admins table for flexible admin role management
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create admin role enum
CREATE TYPE admin_role AS ENUM ('main_admin', 'admin', 'sub_admin');

-- Step 2: Add role column to admins table
ALTER TABLE admins ADD COLUMN role admin_role DEFAULT 'admin';

-- Step 3: Update the current main admin to have 'main_admin' role
-- Replace 'your-user-id' with the actual user ID of the current admin
UPDATE admins
SET role = 'main_admin'
WHERE user_id IN (
    SELECT id FROM users WHERE username = 'admin' OR username = 'adil'
);

-- Step 4: Create an index for performance
CREATE INDEX idx_admins_role ON admins(role);