'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { Models } from 'appwrite';

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const session = await account.get();
      setUser(session);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    await account.create('unique()', email, password, name);
    await signIn(email, password);
  }

  async function signIn(email: string, password: string) {
    await account.createEmailSession(email, password);
    await checkUser();
  }

  async function signOut() {
    await account.deleteSession('current');
    setUser(null);
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}