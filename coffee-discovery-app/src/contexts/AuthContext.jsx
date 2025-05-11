import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const session = supabase.auth.getSession();

    setUser(session?.user ?? null);
    setLoading(false);

    // Listen for changes on auth state
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If we have a user, fetch their role
        if (session?.user) {
          await getUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Get user role from database
  const getUserRole = async (userId) => {
    try {
      // First check if user is admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (adminData) {
        setUserRole('admin');
        return;
      }
      
      // Then check if user is merchant
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (merchantData) {
        setUserRole('merchant');
        return;
      }
      
      // Default to 'user' role
      setUserRole('user');
    } catch (error) {
      console.error('Error getting user role:', error);
      setUserRole('user');
    }
  };

  // Sign up function
  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
