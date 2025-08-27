"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from './api';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth-token';

// Helper function to get token - exported for API service
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for saved token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Verify token and get user data
        try {
          console.log("Verifying token...");
          const data = await authAPI.verifyToken();
          console.log("Token verification response:", data);
          
          if (data && data.user) {
            setAuthState({
              user: data.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log("User authenticated with isAdmin:", data.user.isAdmin);
          } else {
            throw new Error("Invalid user data from token verification");
          }
        } catch (error) {
          // Invalid token
          console.error("Token verification failed:", error);
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      console.log('Attempting login with:', { email });
      const data = await authAPI.login(email, password);
      console.log('Login response:', data);
      
      // Store token in appropriate storage based on rememberMe flag
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, data.token);
      } else {
        sessionStorage.setItem(TOKEN_KEY, data.token);
      }
      
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: data.message || "Login successful" };
    } catch (error: any) {
      console.error("Login error:", error);
      // Try demo login for testing if API is down
      if (!error.response && email === 'test@example.com' && password === 'test123') {
        const demoUser = {
          _id: 'demo_user_123',
          username: 'Test User',
          email: 'test@example.com',
          isAdmin: false
        };
        const demoToken = 'demo_token_' + Date.now();
        
        // Store in session storage
        sessionStorage.setItem(TOKEN_KEY, demoToken);
        
        setAuthState({
          user: demoUser,
          token: demoToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true, message: "Demo login successful" };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.error || error.message || "Login failed" 
      };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Attempting registration with:', { username, email });
      const data = await authAPI.register(username, email, password);
      console.log('Registration response:', data);
      
      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: data.message || "Registration successful" };
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Try demo registration for testing if API is down
      if (!error.response) {
        const demoUser = {
          _id: 'demo_user_' + Date.now(),
          username,
          email,
          isAdmin: false
        };
        const demoToken = 'demo_token_' + Date.now();
        
        localStorage.setItem(TOKEN_KEY, demoToken);
        
        setAuthState({
          user: demoUser,
          token: demoToken,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true, message: "Demo registration successful" };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.error || error.message || "Registration failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const forgotPassword = async (email: string) => {
    try {
      const data = await authAPI.forgotPassword(email);
      return { 
        success: true, 
        message: data.message || "Password reset email sent" 
      };
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Failed to send reset email" 
      };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const data = await authAPI.resetPassword(token, password);
      return { 
        success: true, 
        message: data.message || "Password reset successful" 
      };
    } catch (error: any) {
      console.error("Reset password error:", error);
      return { 
        success: false, 
        message: error.response?.data?.error || "Failed to reset password" 
      };
    }
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
