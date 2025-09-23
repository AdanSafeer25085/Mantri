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
CREATE TYPE lead_type AS ENUM ('Cold', 'Warm', 'Hot', '');

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
    lead_type lead_type DEFAULT '',
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
-- MIGRATION COMPLETE!
-- =====================================================
-- After running all these commands, your Supabase database is ready.
-- Next steps:
-- 1. Install Supabase client in frontend: npm install @supabase/supabase-js
-- 2. Configure Supabase client with your API key
-- 3. Update frontend code to use Supabase instead of backend API calls
-- 4. Test all functionality
-- 5. Delete the backend folder once everything works