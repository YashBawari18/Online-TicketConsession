import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type User = {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  roll_number?: string;
  type: 'student' | 'admin';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, userType: 'student' | 'admin') => Promise<void>;
  signUp: (data: StudentSignUpData) => Promise<void>;
  signOut: () => Promise<void>;
};

type StudentSignUpData = {
  rollNumber: string;
  name: string;
  email: string;
  password: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string, userType: 'student' | 'admin') => {
    try {
      if (userType === 'student') {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !data) {
          throw new Error('Invalid credentials');
        }

        // In production, you'd hash and compare passwords properly
        const userData: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          roll_number: data.roll_number,
          type: 'student'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('username', email)
          .single();

        if (error || !data) {
          throw new Error('Invalid credentials');
        }

        const userData: User = {
          id: data.id,
          username: data.username,
          type: 'admin'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      throw new Error('Sign in failed');
    }
  };

  const signUp = async (data: StudentSignUpData) => {
    try {
      const { error } = await supabase
        .from('students')
        .insert([{
          roll_number: data.rollNumber,
          name: data.name,
          email: data.email,
          password_hash: data.password // In production, hash this properly
        }]);

      if (error) {
        throw new Error('Sign up failed');
      }
    } catch (error) {
      throw new Error('Sign up failed');
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};