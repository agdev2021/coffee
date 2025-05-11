-- RLS Policies for Products Table

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

-- RLS Policies for User Queries Table

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

-- RLS Policies for Merchants Table

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

-- RLS Policies for Admins Table

-- Allow admins to read the admins table
CREATE POLICY read_admins ON admins
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Allow superadmins to manage admins (this would be managed manually)
CREATE POLICY manage_admins ON admins
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
