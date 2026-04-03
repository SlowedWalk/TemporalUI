import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Tier } from '@temporalui/react';

interface User {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  signal: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateTier: (tier: Tier) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@temporalui.com',
  password: 'demo123',
  name: 'Demo User',
  tier: 'T0',
  signal: 0,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('temporalui_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const hashPassword = (password: string): string => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  };

  const login = async (email: string, password: string) => {
    // Check demo user first
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const userData: User = {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        tier: DEMO_USER.tier,
        signal: DEMO_USER.signal,
      };
      setUser(userData);
      localStorage.setItem('temporalui_user', JSON.stringify(userData));
      
      // Track session
      const sessionCount = parseInt(localStorage.getItem('temporalui_session_count') || '0') + 1;
      localStorage.setItem('temporalui_session_count', sessionCount.toString());
      localStorage.setItem('temporalui_last_login', new Date().toLocaleDateString());
      return;
    }

    // Check registered users
    const storedUsers = JSON.parse(localStorage.getItem('temporalui_users') || '{}');
    const userData = storedUsers[email];

    if (!userData) {
      throw new Error('Invalid credentials');
    }

    if (userData.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid credentials');
    }

    const loggedInUser: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      tier: userData.tier,
      signal: userData.signal,
    };

    setUser(loggedInUser);
    localStorage.setItem('temporalui_user', JSON.stringify(loggedInUser));
    
    // Track session
    const sessionCount = parseInt(localStorage.getItem('temporalui_session_count') || '0') + 1;
    localStorage.setItem('temporalui_session_count', sessionCount.toString());
    localStorage.setItem('temporalui_last_login', new Date().toLocaleDateString());
  };

  const register = async (email: string, password: string, name: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('temporalui_users') || '{}');

    if (storedUsers[email]) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      passwordHash: hashPassword(password),
      tier: 'T0',
      signal: 0,
    };

    storedUsers[email] = newUser;
    localStorage.setItem('temporalui_users', JSON.stringify(storedUsers));

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      tier: newUser.tier,
      signal: newUser.signal,
    };

    setUser(userData);
    localStorage.setItem('temporalui_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('temporalui_user');
  };

  const updateTier = async (tier: Tier) => {
    if (!user) return;

    const updatedUser = { ...user, tier };
    setUser(updatedUser);
    localStorage.setItem('temporalui_user', JSON.stringify(updatedUser));

    const storedUsers = JSON.parse(localStorage.getItem('temporalui_users') || '{}');
    if (storedUsers[user.email]) {
      storedUsers[user.email].tier = tier;
      localStorage.setItem('temporalui_users', JSON.stringify(storedUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateTier, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
