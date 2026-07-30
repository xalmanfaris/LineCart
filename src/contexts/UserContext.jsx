import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUserApi, logoutUser, fetchProfile, storeTokens, clearTokens, getCookie, refreshToken as refreshTokenApi } from '../api';

export const UserContext = createContext(null);

export const useUser = () => {
  return useContext(UserContext);
};


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
       
        let token = getCookie('accessToken');

        if (!token) {
          console.log('[UserProvider] No access token found, attempting to refresh session...');
          try {
           
            const refreshResult = await refreshTokenApi();
            token = refreshResult.AccessToken || refreshResult.accessToken;
            console.log('[UserProvider] Session refreshed successfully');
          } catch (refreshErr) {
            console.log('[UserProvider] No active session or refresh failed');
            setLoading(false);
            return;
          }
        }

        console.log('[UserProvider] Token active, fetching profile...');

     
        const profile = await fetchProfile();
        console.log('[UserProvider] Profile fetched:', profile);

        if (profile) {
          setUser({
            id: profile.Id || profile.id,
            name: profile.Name || profile.name,
            email: profile.Email || profile.email,
            role: (profile.Role || profile.role)?.toLowerCase(),
            cart: profile.cart || profile.Cart || [],
            wishlist: profile.wishlist || profile.Wishlist || [],
          });
        }
      } catch (err) {
        console.log('[UserProvider] User initialization failed:', err.message);


        if (err.response?.status === 401 || err.response?.status === 403) {
          clearTokens();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  const login = async (email, password) => {
    try {
      if (!email.trim()) {
        throw new Error('Email is required');
      }

      const result = await loginUser(email, password);

    
      const accessToken = result.AccessToken || result.accessToken || result.token;
      const refreshToken = result.RefreshToken || result.refreshToken || result.refreshToken;

      if (!accessToken) {
        console.error('[UserProvider] Login response:', result);
        throw new Error('Login failed: No access token received');
      }

     
      storeTokens(accessToken, refreshToken);
      console.log('[UserProvider] Tokens stored in cookies');


      let userData;
      try {
        const profile = await fetchProfile();
        userData = {
          id: profile.Id || profile.id,
          name: profile.Name || profile.name,
          email: profile.Email || profile.email,
          role: (profile.Role || profile.role)?.toLowerCase(),
          cart: profile.cart || profile.Cart || [],
          wishlist: profile.wishlist || profile.Wishlist || [],
        };
      } catch (profileErr) {
        console.warn('[UserProvider] Could not fetch profile, using basic user data');
        
        userData = {
          email: email,
          role: 'user',
          cart: [],
          wishlist: [],
        };
      }

      setUser(userData);
      return { ...userData };
    } catch (err) {
      if (err instanceof Error) {
        console.error('[UserContext] Login error caught:', err.message);
        throw err;
      }

      const backendMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.message;

      console.error('[UserProvider] Login error:', backendMsg);
      throw new Error(backendMsg);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      console.log('[UserProvider] Logged out successfully');
    } catch (err) {
      console.log('[UserProvider] Logout API call failed, clearing local state anyway');
    }

   
    clearTokens();
    setUser(null);
  };

  const register = async ({ name, email, password }) => {
    try {
      if (!name || !name.trim()) {
        throw new Error('Full name is required');
      }
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      if (!password || !password.trim()) {
        throw new Error('Password is required');
      }

      const result = await registerUserApi(name, email, password);

      if (!result.success) {
        throw new Error(result.message || 'Registration failed');
      }


      return login(email, password);
    } catch (err) {
   
      const errorMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, register, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

