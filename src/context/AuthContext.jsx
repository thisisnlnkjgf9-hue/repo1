import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nouryum_token') || null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.getMe();
      setUser({ ...res.user, id: res.user.id || res.user.userId });
    } catch {
      // Token invalid or expired
      setToken(null);
      setUser(null);
      localStorage.removeItem('nouryum_token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (googleCredential) => {
    const res = await api.loginWithGoogle(googleCredential);
    const newToken = res.sessionToken;
    
    localStorage.setItem('nouryum_token', newToken);
    setToken(newToken);
    
    setUser({ ...res.user, id: res.user.id || res.user.userId });
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nouryum_token');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
