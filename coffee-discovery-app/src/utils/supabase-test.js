// A simple script to test Supabase connection
import { supabase } from '../services/supabase';

// This function tests the connection to Supabase
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to fetch the Supabase version
    const { data, error } = await supabase.from('products').select('count');
    
    if (error) {
      console.error('Supabase connection failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
    
    console.log('Supabase connection successful!', data);
    return {
      success: true,
      message: 'Connected to Supabase successfully'
    };
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      message: err.message
    };
  }
}
