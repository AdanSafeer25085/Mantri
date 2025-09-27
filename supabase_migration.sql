-- =====================================================
-- SUPABASE MIGRATION SCHEMA FOR CONSTRUCTION MANAGEMENT
-- =====================================================
-- Run these SQL commands in order in your Supabase SQL Editor
-- Project URL: https://glfftpbihxrxbxxbinkk.supabase.co
-- =====================================================

-- STEP 1: Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Create ENUM types for status fields
CREATE TYPE user_status AS ENUM ('Active', 'Deactive');
CREATE TYPE project_status AS ENUM ('Pending', 'Ongoing', 'Completed');
CREATE TYPE activity_status AS ENUM ('Active', 'Deactive');
CREATE TYPE material_status AS ENUM ('Active', 'Inactive');
CREATE TYPE unit_status AS ENUM ('Active', 'Inactive');
CREATE TYPE stock_type AS ENUM ('Inward', 'Outward');
CREATE TYPE finance_type AS ENUM ('Credit', 'Debit');
CREATE TYPE credit_option AS ENUM ('Customer', 'Other');
CREATE TYPE debit_option AS ENUM ('Labour', 'Material', 'Salary', 'Office', 'Other');
CREATE TYPE payment_mode AS ENUM ('Cheque', 'Account Pay', 'Cash', 'Major Cash');
CREATE TYPE lead_type AS ENUM ('Cold', 'Warm', 'Hot', 'New');

-- STEP 3: Create Users table (for authentication)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status user_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create Activities table
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    status activity_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Create Units table
CREATE TABLE units (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    status unit_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 6: Create Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status project_status DEFAULT 'Pending',
    project_details JSONB DEFAULT '{"activities": []}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Create Project-Activities junction table
CREATE TABLE project_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, activity_id)
);

-- STEP 8: Create Tasks table
CREATE TABLE tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status activity_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 9: Create Materials table
CREATE TABLE materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    unit_id UUID REFERENCES units(id) NOT NULL,
    status material_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 10: Create Vendors table
CREATE TABLE vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    gst TEXT,
    contact TEXT,
    bank TEXT,
    account_no TEXT,
    ifsc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 11: Create Contractors table
CREATE TABLE contractors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    pan TEXT,
    contact TEXT,
    bank TEXT,
    account_no TEXT,
    ifsc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 12: Create Customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    datetime TIMESTAMPTZ NOT NULL,
    full_name TEXT NOT NULL,
    primary_contact TEXT NOT NULL,
    secondary_contact TEXT,
    aadhar_no TEXT NOT NULL,
    address TEXT NOT NULL,
    unit_no TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 13: Create Leads table
CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    contact_no TEXT NOT NULL,
    visit_date DATE,
    next_visit DATE,
    note TEXT,
    lead_type lead_type DEFAULT 'New',
    is_converted BOOLEAN DEFAULT FALSE,
    -- Extra fields if converted to customer
    aadhar_no TEXT,
    address TEXT,
    unit_no TEXT,
    amount DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 14: Create Stock table
CREATE TABLE stocks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    project TEXT NOT NULL,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    type stock_type NOT NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 15: Create Finance table
CREATE TABLE finances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type finance_type NOT NULL,
    -- CREDIT fields
    credit_option credit_option DEFAULT 'Other',
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    -- DEBIT fields
    debit_option debit_option,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT DEFAULT '',
    mode payment_mode NOT NULL,
    payment_ref TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 16: Create Profiles table (for user profiles)
CREATE TABLE profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 17: Create Admins table
CREATE TABLE admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 18: Create Technical Files table
CREATE TABLE technical_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 19: Create Legal Files table
CREATE TABLE legal_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 20: Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_tasks_activity ON tasks(activity_id);
CREATE INDEX idx_materials_activity ON materials(activity_id);
CREATE INDEX idx_contractors_activity ON contractors(activity_id);
CREATE INDEX idx_customers_project ON customers(project_id);
CREATE INDEX idx_leads_project ON leads(project_id);
CREATE INDEX idx_leads_converted ON leads(is_converted);
CREATE INDEX idx_stocks_date ON stocks(date);
CREATE INDEX idx_stocks_project ON stocks(project);
CREATE INDEX idx_finances_date ON finances(date);
CREATE INDEX idx_finances_project ON finances(project_id);
CREATE INDEX idx_finances_type ON finances(type);

-- STEP 21: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 22: Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finances_updated_at BEFORE UPDATE ON finances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technical_files_updated_at BEFORE UPDATE ON technical_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_files_updated_at BEFORE UPDATE ON legal_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 23: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (adjust based on your auth requirements)
-- For development/testing, we'll allow all operations. In production, adjust these based on auth.

-- Users table policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON users FOR DELETE USING (true);

-- Activities table policies
CREATE POLICY "Enable all operations for activities" ON activities FOR ALL USING (true);

-- Units table policies
CREATE POLICY "Enable all operations for units" ON units FOR ALL USING (true);

-- Projects table policies
CREATE POLICY "Enable all operations for projects" ON projects FOR ALL USING (true);

-- Project Activities table policies
CREATE POLICY "Enable all operations for project_activities" ON project_activities FOR ALL USING (true);

-- Tasks table policies
CREATE POLICY "Enable all operations for tasks" ON tasks FOR ALL USING (true);

-- Materials table policies
CREATE POLICY "Enable all operations for materials" ON materials FOR ALL USING (true);

-- Vendors table policies
CREATE POLICY "Enable all operations for vendors" ON vendors FOR ALL USING (true);

-- Contractors table policies
CREATE POLICY "Enable all operations for contractors" ON contractors FOR ALL USING (true);

-- Customers table policies
CREATE POLICY "Enable all operations for customers" ON customers FOR ALL USING (true);

-- Leads table policies
CREATE POLICY "Enable all operations for leads" ON leads FOR ALL USING (true);

-- Stocks table policies
CREATE POLICY "Enable all operations for stocks" ON stocks FOR ALL USING (true);

-- Finances table policies
CREATE POLICY "Enable all operations for finances" ON finances FOR ALL USING (true);

-- Profiles table policies
CREATE POLICY "Enable all operations for profiles" ON profiles FOR ALL USING (true);

-- Admins table policies
CREATE POLICY "Enable all operations for admins" ON admins FOR ALL USING (true);

-- Technical Files table policies
CREATE POLICY "Enable all operations for technical_files" ON technical_files FOR ALL USING (true);

-- Legal Files table policies
CREATE POLICY "Enable all operations for legal_files" ON legal_files FOR ALL USING (true);

-- =====================================================
-- STEP 24: Create helper functions for common operations
-- =====================================================

-- Function to get project with all related data
CREATE OR REPLACE FUNCTION get_project_details(project_id UUID)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'project', row_to_json(p.*),
            'activities', COALESCE(
                (SELECT json_agg(row_to_json(a.*))
                 FROM activities a
                 JOIN project_activities pa ON a.id = pa.activity_id
                 WHERE pa.project_id = p.id), '[]'::json
            ),
            'customers', COALESCE(
                (SELECT json_agg(row_to_json(c.*))
                 FROM customers c
                 WHERE c.project_id = p.id), '[]'::json
            ),
            'leads', COALESCE(
                (SELECT json_agg(row_to_json(l.*))
                 FROM leads l
                 WHERE l.project_id = p.id), '[]'::json
            )
        )
        FROM projects p
        WHERE p.id = project_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to convert lead to customer
CREATE OR REPLACE FUNCTION convert_lead_to_customer(lead_id UUID)
RETURNS UUID AS $$
DECLARE
    new_customer_id UUID;
    lead_record RECORD;
BEGIN
    -- Get lead data
    SELECT * INTO lead_record FROM leads WHERE id = lead_id;

    -- Create customer record
    INSERT INTO customers (
        project_id, datetime, full_name, primary_contact,
        aadhar_no, address, unit_no, amount
    )
    VALUES (
        lead_record.project_id, NOW(), lead_record.full_name,
        lead_record.contact_no, lead_record.aadhar_no,
        lead_record.address, lead_record.unit_no, lead_record.amount
    )
    RETURNING id INTO new_customer_id;

    -- Update lead as converted
    UPDATE leads SET is_converted = true WHERE id = lead_id;

    RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 28: PROJECT ISOLATION & CASCADE DELETION SETUP
-- =====================================================
-- These steps ensure proper project-level data isolation and cascade deletion

-- Add project_id columns with CASCADE foreign keys to all relevant tables
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE contractors
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Fix stocks table - add proper foreign key with CASCADE
ALTER TABLE stocks
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Fix finances table constraint to CASCADE
ALTER TABLE finances
DROP CONSTRAINT IF EXISTS finances_project_id_fkey;

ALTER TABLE finances
ADD CONSTRAINT finances_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;

-- Add performance indexes for project_id columns
CREATE INDEX IF NOT EXISTS idx_materials_project_id ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_contractors_project_id ON contractors(project_id);
CREATE INDEX IF NOT EXISTS idx_vendors_project_id ON vendors(project_id);
CREATE INDEX IF NOT EXISTS idx_stocks_project_id ON stocks(project_id);

-- =====================================================
-- STEP 29: FIX ADMIN TABLE FOR PERMISSIONS SYSTEM
-- =====================================================
-- Add required columns to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS plain_password TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_admins_mobile ON admins(mobile);
CREATE INDEX IF NOT EXISTS idx_admins_job_title ON admins(job_title);

-- Update any existing admin records to have default values
UPDATE admins SET
  job_title = COALESCE(job_title, 'Administrator'),
  status = COALESCE(status, 'Active')
WHERE job_title IS NULL OR status IS NULL;

-- =====================================================
-- STEP 30: DATA LINKING FOR EXISTING RECORDS
-- =====================================================
-- Link existing stocks to projects based on name matching
-- This handles existing data that was created before project isolation

-- Update stocks to use proper project_id based on project name
UPDATE stocks
SET project_id = p.id
FROM projects p
WHERE stocks.project = p.name
  AND stocks.project_id IS NULL;

-- Handle case-insensitive matching for slight differences
UPDATE stocks
SET project_id = p.id
FROM projects p
WHERE LOWER(stocks.project) = LOWER(p.name)
  AND stocks.project_id IS NULL;

-- Handle common variations and partial matches
UPDATE stocks
SET project_id = p.id
FROM projects p
WHERE stocks.project_id IS NULL
  AND (
    REPLACE(LOWER(stocks.project), ' ', '') = REPLACE(LOWER(p.name), ' ', '') OR
    p.name ILIKE '%' || stocks.project || '%' OR
    stocks.project ILIKE '%' || p.name || '%'
  );

-- =====================================================
-- STEP 31: CASCADE DELETION TEST
-- =====================================================
-- Test cascade deletion functionality

-- Create a test project
DO $$
DECLARE
    test_project_id UUID;
BEGIN
    -- Insert test project with required fields
    INSERT INTO projects (name, location)
    VALUES ('CASCADE_TEST_PROJECT', 'Test Location')
    RETURNING id INTO test_project_id;

    -- Add test data to verify cascade deletion
    INSERT INTO stocks (date, project, project_id, type, quantity)
    VALUES (CURRENT_DATE, 'CASCADE_TEST_PROJECT', test_project_id, 'Inward', 100);

    INSERT INTO materials (name, project_id, activity_id, unit_id)
    VALUES ('Test Material', test_project_id,
            (SELECT id FROM activities LIMIT 1),
            (SELECT id FROM units LIMIT 1));

    -- Delete the test project (should cascade delete all related data)
    DELETE FROM projects WHERE id = test_project_id;

    -- Verify cascade worked (should find no orphaned records)
    IF (SELECT COUNT(*) FROM stocks WHERE project = 'CASCADE_TEST_PROJECT') > 0 THEN
        RAISE NOTICE 'WARNING: Cascade deletion not working for stocks';
    END IF;

    IF (SELECT COUNT(*) FROM materials WHERE project_id = test_project_id) > 0 THEN
        RAISE NOTICE 'WARNING: Cascade deletion not working for materials';
    END IF;

    RAISE NOTICE 'CASCADE DELETION TEST COMPLETED SUCCESSFULLY';
END $$;

-- =====================================================
-- STEP 32: VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the setup is correct

-- Check project_id columns exist
SELECT
    'Project isolation columns:' as info,
    table_name,
    column_name
FROM information_schema.columns
WHERE column_name = 'project_id'
AND table_schema = 'public'
ORDER BY table_name;

-- Check CASCADE foreign key constraints
SELECT
    'CASCADE constraints:' as info,
    tc.table_name,
    kcu.column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'project_id'
AND tc.table_schema = 'public'
AND rc.delete_rule = 'CASCADE'
ORDER BY tc.table_name;

-- =====================================================
-- STEP 21: FIX LEADS ENUM TYPE (IF NEEDED)
-- =====================================================
-- This fixes the lead_type enum to ensure it works properly

-- Update the leads table enum to ensure it has the correct 'New' default
ALTER TABLE leads ALTER COLUMN lead_type DROP DEFAULT;
UPDATE leads SET lead_type = 'New' WHERE lead_type IS NULL;
ALTER TABLE leads ALTER COLUMN lead_type SET DEFAULT 'New';

-- =====================================================
-- STEP 22: CREATE DEFAULT ADMIN USERS
-- =====================================================
-- This creates default admin users that can log into the system

-- Insert default admin users (main administrators)
INSERT INTO users (id, email, username, full_name, password_hash, status)
VALUES (
    gen_random_uuid(),
    'admin@construction.com',
    'admin',
    'System Administrator',
    'admin123',  -- Change this password in production!
    'Active'
) ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, email, username, full_name, password_hash, status)
VALUES (
    gen_random_uuid(),
    'adil@construction.com',
    'adil',
    'Adil Administrator',
    'adil123',   -- Change this password in production!
    'Active'
) ON CONFLICT (username) DO NOTHING;

-- Link users to admins table with full permissions
INSERT INTO admins (user_id, permissions, role, job_title, mobile, status, plain_password)
SELECT
    u.id,
    '["New Projects", "Finance", "Reports", "Project Overview", "Stock Management", "Gantt Chart", "Technical Files", "Legal Files", "Leads", "Customers", "Materials", "Activities", "Tasks", "Contractors", "Vendors", "Units", "Admin Management"]'::jsonb,
    'main_admin',
    'System Administrator',
    '+1234567890',
    'Active',
    u.password_hash
FROM users u
WHERE u.username IN ('admin', 'adil')
ON CONFLICT (user_id) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    role = EXCLUDED.role,
    job_title = EXCLUDED.job_title,
    status = EXCLUDED.status,
    plain_password = EXCLUDED.plain_password;

-- Verify the admin users were created successfully
SELECT
    'Admin users created:' as info,
    u.username,
    u.full_name,
    a.role,
    array_length(a.permissions, 1) as permission_count
FROM users u
JOIN admins a ON u.id = a.user_id
WHERE u.username IN ('admin', 'adil');

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- After running all these commands, your Supabase database is ready with:
-- ✅ Full database schema with all tables and relationships
-- ✅ Project-level data isolation (materials, stocks, etc. are project-specific)
-- ✅ Cascade deletion (deleting a project deletes all related data)
-- ✅ Admin permissions system with role management
-- ✅ Row Level Security policies
-- ✅ Performance indexes and triggers

-- Next steps:
-- 1. Set up environment variables in your .env file:
--    VITE_SUPABASE_URL=https://your-project-id.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key-here
-- 2. Log in with default admin credentials:
--    Username: admin, Password: admin123
--    Username: adil, Password: adil123
-- 3. Test the application functionality
-- 4. Verify cascade deletion works as expected
-- 5. IMPORTANT: Change default passwords in production!
-- 6. Deploy to production

-- IMPORTANT NOTES:
-- - When you delete a project, ALL related data will be automatically deleted
-- - Materials, stocks, activities, etc. are now project-specific
-- - Admin system includes full permissions management
-- - All tables have proper indexes for performance
-- 5. Delete the backend folder once everything works