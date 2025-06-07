import "@bacons/text-decoder/install";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initDatabase } from "../lib/database";
import { TRPCProvider } from "~/utils/api";
import { AuthProvider } from "../contexts/AuthContext";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const queryClient = new QueryClient();

  useEffect(() => {
    // Initialize database if needed
    initDatabase();
  }, []);

  return (
    <TRPCProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="AuthScreen" options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </TRPCProvider>
  );
}
