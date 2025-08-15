import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: number;
  username: string;
  email: string;
  dateOfBirth?: string;
  heightCm?: number;
  currentWeightKg?: number;
  gender?: string;
  activityLevel?: string;
  fitnessGoal?: string;
  targetWeightKg?: number;
  preferredUnits?: string;
  timezone?: string;
  age?: number;
  bmi?: number;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyWater?: number;
  weeklyWorkouts?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string, dateOfBirth?: string) => Promise<void>;
  registerFull: (userData: RegisterUserData) => Promise<void>;
  initialize: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  heightCm?: number;
  currentWeightKg?: number;
  gender?: string;
  activityLevel?: string;
  fitnessGoal?: string;
  targetWeightKg?: number;
  preferredUnits?: string;
  dailyCalories?:number;
  dailyProtein?:number;
  dailyCarbs?:number;
  dailyFat?:number;
  dailyWater?:number;
  weeklyWorkouts?:number;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

// Replace with your actual IP
const API_BASE_URL = 'http://10.0.0.17:8091';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Extract tokens and user data
      const { user, accessToken, refreshToken } = data;

      // Store tokens securely
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, dateOfBirth?: string) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          dateOfBirth,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Extract tokens and user data
      const { user, accessToken, refreshToken } = data;

      // Store tokens securely
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerFull: async (userData: RegisterUserData) => {
    try {
      set({ isLoading: true });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Extract tokens and user data
      const { user, accessToken, refreshToken } = data;

      // Store tokens securely
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      set({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const { accessToken } = get();

      // Optional: Call logout endpoint
      if (accessToken) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
        } catch (error) {
          console.log('Logout API call failed:', error);
        }
      }

      // Remove tokens from secure storage
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });

    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      set({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const userString = await SecureStore.getItemAsync(USER_KEY);

      if (accessToken && refreshToken && userString) {
        const user = JSON.parse(userString);
        
        // Validate token with backend
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            set({
              isAuthenticated: true,
              user,
              accessToken,
              refreshToken,
              isLoading: false,
            });
          } else {
            // Token is invalid, try to refresh
            const refreshed = await get().refreshAccessToken();
            if (!refreshed) {
              // Refresh failed, clear everything
              await get().logout();
            }
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          await get().logout();
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  refreshAccessToken: async () => {
    try {
      const { refreshToken } = get();
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        const newAccessToken = data.accessToken;
        
        // Update stored access token
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken);
        
        set({
          accessToken: newAccessToken,
        });
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  },

  updateUser: (userData: Partial<User>) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...userData };
      set({ user: updatedUser });
      
      // Update stored user data
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    }
  },
}));