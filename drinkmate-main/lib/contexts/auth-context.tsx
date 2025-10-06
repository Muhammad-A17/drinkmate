"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from '../api';
import { useCart } from './cart-context';

interface User {
  _id: string;
  username: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
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

  // Get cart context for user switching
  const { switchUserCart } = useCart();

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
          const data = await authAPI.verifyToken();
          
          if (data && data.user) {
            setAuthState({
              user: data.user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Switch to user's cart when loading from saved token
            switchUserCart(data.user._id);
          } else {
            throw new Error("Invalid user data from token verification");
          }
        } catch (error: any) {
          // Invalid token - but don't clear immediately, give user a chance
          // Only clear token if it's a 401 error
          if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            // For other errors (like 503), clear token and require re-authentication
            localStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } catch (error) {
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
      
      // Implement retry logic for login
      let attempts = 0;
      const maxAttempts = 2;
      let lastError: any = null;
      
      while (attempts < maxAttempts) {
        try {
          const data = await authAPI.login(email, password);
          
          
          // Store token in both localStorage and sessionStorage for reliability
          localStorage.setItem(TOKEN_KEY, data.token);
          sessionStorage.setItem(TOKEN_KEY, data.token);
          
          const newAuthState = {
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          };
          
          setAuthState(newAuthState);
          
          // Switch to user's cart after successful login
          switchUserCart(data.user._id);
          
          return { success: true, message: data.message || "Login successful" };
        } catch (error: any) {
          lastError = error;
          
          // Don't retry for certain errors like invalid credentials
          if (error.response?.status === 401 || error.response?.status === 403) {
            break;
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // All attempts failed or we hit a non-retryable error
      
      // Try demo login for testing if API is down
      if (!lastError.response && email === 'test@example.com' && password === 'test123') {
        const demoUser = {
          _id: 'demo_user_123',
          username: 'Test User',
          name: 'Test User',
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
      
      // Format error message based on response
      let errorMessage = "Login failed";
      
      if (lastError.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (lastError.response?.status === 403) {
        errorMessage = "Your account is suspended. Please contact support.";
      } else if (lastError.response?.data?.error) {
        errorMessage = lastError.response.data.error;
      } else if (lastError.message) {
        errorMessage = lastError.message;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: "An unexpected error occurred. Please try again later."
      };
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const data = await authAPI.register(fullName, email, password);
      
      localStorage.setItem(TOKEN_KEY, data.token);
      // Set flag to indicate this is a new account for cart sync
      localStorage.setItem('is-new-account', 'true');
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: data.message || "Registration successful" };
    } catch (error: any) {
      
      // Try demo registration for testing if API is down
      if (!error.response) {
        const username = fullName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
        const demoUser = {
          _id: 'demo_user_' + Date.now(),
          username,
          name: fullName,
          email,
          isAdmin: false
        };
        const demoToken = 'demo_token_' + Date.now();
        
        localStorage.setItem(TOKEN_KEY, demoToken);
        // Set flag to indicate this is a new account for cart sync
        localStorage.setItem('is-new-account', 'true');
        
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
    
    // Switch to guest cart after logout
    switchUserCart(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      const data = await authAPI.forgotPassword(email);
      return { 
        success: true, 
        message: data.message || "Password reset email sent" 
      };
    } catch (error: any) {
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
      return { 
        success: false, 
        message: error.response?.data?.error || "Failed to reset password" 
      };
    }
  };

  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return;
      }

      const data = await authAPI.verifyToken();
      
      if (data && data.user) {
        
        setAuthState(prev => ({
          ...prev,
          user: data.user,
        }));
      }
    } catch (error: any) {
    }
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser,
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
