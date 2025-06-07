// hooks/useAuth.ts
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

export const AuthProvider = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("userData");

      if (token) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: userData ? JSON.parse(userData) : null,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const login = async (token: string, userData?: any) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      if (userData) {
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: userData || null,
      });
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuthState,
  };
};
