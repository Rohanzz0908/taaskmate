import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '../types';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'tm_portal_auth_session_v1';
const REMEMBERED_USER_KEY = 'tm_portal_remembered_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure name is updated to Test Admin and remove photo
        parsed.name = 'Test Admin';
        delete parsed.avatar;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const login = async (
    emailOrUsername: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmedInput = emailOrUsername.trim();
    const cleanPassword = password.trim();

    // Default credentials check:
    // admin@taaskmate.com / admin123 OR username admin / admin123
    const isValidAdmin = (
      (trimmedInput.toLowerCase() === 'admin@taaskmate.com' || trimmedInput.toLowerCase() === 'admin') &&
      cleanPassword === 'admin123'
    );

    // Also accept any valid format with 'admin123' for flexible testing
    const isGenericDemo = cleanPassword === 'admin123' && trimmedInput.length > 2;

    if (!isValidAdmin && !isGenericDemo) {
      return { 
        success: false, 
        message: 'Invalid credentials. Use demo account: admin@taaskmate.com / admin123' 
      };
    }

    const sessionUser: UserSession = {
      id: 'usr-001',
      email: trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@taaskmate.com`,
      name: 'Test Admin',
      role: 'Administrator',
      lastLogin: new Date().toISOString(),
    };

    setUser(sessionUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));

    if (rememberMe) {
      localStorage.setItem(REMEMBERED_USER_KEY, trimmedInput);
    } else {
      localStorage.removeItem(REMEMBERED_USER_KEY);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
