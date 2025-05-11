-- Setup script for Coffee Discovery App Supabase Backend

-- Enable UUID extension
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

-- Create an update trigger for timestamps
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER set_updated_at_products
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_merchants
BEFORE UPDATE ON merchants
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

-- Enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE admins.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Merchant check function
CREATE OR REPLACE FUNCTION is_merchant(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM merchants WHERE merchants.user_id = is_merchant.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get merchant ID function
CREATE OR REPLACE FUNCTION get_merchant_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  merchant_id UUID;
BEGIN
  SELECT id INTO merchant_id FROM merchants WHERE merchants.user_id = get_merchant_id.user_id;
  RETURN merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
