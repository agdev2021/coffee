-- Setup script for Coffee Discovery App Supabase Backend

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  purchase_url TEXT,
  origin TEXT,
  roast_level TEXT DEFAULT 'medium',
  acidity TEXT DEFAULT 'medium',
  flavor_notes TEXT[] DEFAULT '{}',
  merchant_id UUID,
  is_featured BOOLEAN DEFAULT false,
  is_merchant_product BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- User Queries Table
CREATE TABLE IF NOT EXISTS user_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT NOT NULL,
  response_data JSONB,
  user_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an update trigger to set updated_at automatically
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables that need updated_at
CREATE TRIGGER set_updated_at_products
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_merchants
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create an admin user function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a merchant user function
CREATE OR REPLACE FUNCTION is_merchant(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM merchants WHERE merchants.user_id = is_merchant.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a merchant_id function to get a merchant's ID from user_id
CREATE OR REPLACE FUNCTION get_merchant_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  merchant_id UUID;
BEGIN
  SELECT id INTO merchant_id FROM merchants WHERE merchants.user_id = get_merchant_id.user_id;
  RETURN merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---------------------------------------------
-- RLS Policies for Products Table
---------------------------------------------

-- Allow anyone to read all products
CREATE POLICY read_products ON products
  FOR SELECT USING (true);

-- Allow merchants to insert their own products
CREATE POLICY insert_merchant_products ON products
  FOR INSERT
  WITH CHECK (
    merchant_id = get_merchant_id(auth.uid()) AND
    is_merchant(auth.uid())
  );

-- Allow merchants to update their own products
CREATE POLICY update_merchant_products ON products
  FOR UPDATE
  USING (
    merchant_id = get_merchant_id(auth.uid()) AND
    is_merchant(auth.uid())
  )
  WITH CHECK (
    merchant_id = get_merchant_id(auth.uid()) AND
    is_merchant(auth.uid())
  );

-- Allow merchants to delete their own products
CREATE POLICY delete_merchant_products ON products
  FOR DELETE
  USING (
    merchant_id = get_merchant_id(auth.uid()) AND
    is_merchant(auth.uid())
  );

-- Allow admins to do anything with products
CREATE POLICY admin_products ON products
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

---------------------------------------------
-- RLS Policies for User Queries Table
---------------------------------------------

-- Allow authenticated users to insert their own queries
CREATE POLICY insert_user_queries ON user_queries
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (user_id IS NULL OR user_id = auth.uid())
  );

-- Allow admins to read all queries
CREATE POLICY admin_read_queries ON user_queries
  FOR SELECT
  USING (is_admin(auth.uid()));

---------------------------------------------
-- RLS Policies for Merchants Table
---------------------------------------------

-- Allow anyone to read merchant data
CREATE POLICY read_merchants ON merchants
  FOR SELECT USING (true);

-- Allow users to insert their own merchant data (signup)
CREATE POLICY insert_merchant ON merchants
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Allow merchants to update their own merchant data
CREATE POLICY update_merchant ON merchants
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Allow admins to do anything with merchants
CREATE POLICY admin_merchants ON merchants
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

---------------------------------------------
-- RLS Policies for Admins Table
---------------------------------------------

-- Allow admins to read the admins table
CREATE POLICY read_admins ON admins
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Allow superadmins to manage admins (this would be managed manually)
CREATE POLICY manage_admins ON admins
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Insert your first admin user (replace 'your-auth-user-id' with an actual UUID)
-- You'll need to create a user first, then get their UUID, and then run this command
-- INSERT INTO admins (user_id) VALUES ('your-auth-user-id');
