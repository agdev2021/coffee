import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

// Database table names
export const TABLES = {
  PRODUCTS: 'products',
  USERS: 'users',
  QUERIES: 'user_queries',
  MERCHANTS: 'merchants',
}

// Helper functions for common Supabase operations

// Products
export const getProducts = async (filters = {}) => {
  let query = supabase.from(TABLES.PRODUCTS).select('*')
  
  // Apply filters if provided
  if (filters.roast) query = query.eq('roast_level', filters.roast)
  if (filters.acidity) query = query.eq('acidity', filters.acidity)
  if (filters.origin) query = query.ilike('origin', `%${filters.origin}%`)
  if (filters.merchantId) query = query.eq('merchant_id', filters.merchantId)
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }
  
  return data
}

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    throw error
  }
  
  return data
}

export const addProduct = async (product) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .insert(product)
    .select()
  
  if (error) {
    console.error('Error adding product:', error)
    throw error
  }
  
  return data
}

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error(`Error updating product with id ${id}:`, error)
    throw error
  }
  
  return data
}

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from(TABLES.PRODUCTS)
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error(`Error deleting product with id ${id}:`, error)
    throw error
  }
  
  return true
}

// User Queries
export const saveUserQuery = async (query, response) => {
  const { data, error } = await supabase
    .from(TABLES.QUERIES)
    .insert({
      query_text: query,
      response_data: response,
      timestamp: new Date().toISOString(),
    })
  
  if (error) {
    console.error('Error saving user query:', error)
    // Non-critical error, so we don't throw
  }
  
  return data
}

export const getUserQueries = async () => {
  const { data, error } = await supabase
    .from(TABLES.QUERIES)
    .select('*')
    .order('timestamp', { ascending: false })
  
  if (error) {
    console.error('Error fetching user queries:', error)
    throw error
  }
  
  return data
}
