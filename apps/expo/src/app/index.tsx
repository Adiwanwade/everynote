// app/index.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { AuthProvider } from "../hooks/useAuth";

export default function Index() {
  const { isAuthenticated, isLoading } = AuthProvider();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("./HomeScreen"); // Redirect to HomeScreen if authenticated
      } else {
        router.replace("./AuthScreen"); // Redirect to AuthScreen if not authenticated
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // This component will redirect, so we don't need to render anything else
  return null;
}
