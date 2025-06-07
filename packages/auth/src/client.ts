import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_AUTH_URL || "http://localhost:8081", // Your backend URL
});

export const { useSession, signIn, signUp, signOut } = authClient;
