import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getUserInfo } from '../services/authService';
import { removeAccessToken } from '../utils/storageUtils';
import { User, LoginCredentials } from '../types';
import { AuthContextType } from '../types/context';
import { login as loginService } from '../services/authService';

const UserContext = createContext<AuthContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const API_BASE_URL = import.meta.env.VITE_APP_BE_URL;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      getUserInfo()
        .then((userData) => {
          setUser(userData);
          setAuthenticated(true);
        })
        .catch((err) => {
          console.error('Error fetching user info:', err);
          logout();
        });
    }
  }, []);

  const logout = (): void => {
    removeAccessToken();
    setUser(null);
    setAuthenticated(false);
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const response = await loginService(credentials);
      const token = response.accessToken;
      
      if (token) {
        const userData = await getUserInfo();
        setUser(userData);
        setAuthenticated(true);
      }
    } catch (error) {
      setAuthenticated(false);
      throw new Error('Login failed');
    }
  };

  return (
    <UserContext.Provider value={{ user, authenticated, login, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };

