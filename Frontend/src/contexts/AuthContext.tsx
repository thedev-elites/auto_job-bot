import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData?: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (userData?: Partial<User>) => {
    setIsLoading(true);
    
    try {
      console.log('Login called with userData:', userData);
      
      // If userData is provided (from Google or form), use it
      // Otherwise use mock data
      const userToStore = userData ? {
        id: userData.id || '1',
        name: userData.name || 'User',
        email: userData.email || 'user@example.com',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
      } : {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
      };
      
      console.log('User data being stored:', userToStore);
      
      // Save user to state and localStorage
      setUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
