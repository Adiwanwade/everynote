

// auth/AuthProvider.tsx - Auth Provider component
import React, { createContext, useContext, useEffect, useState } from "react";
// Define Session type locally if not exported from better-auth/react
export interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
  };
  expires: string;
  [key: string]: any;
}
// import type { Session } from "better-auth/react";
import { authClient } from "../../../../packages/auth/src/client";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (data) {
          // Map the returned data to match the Session interface
          setSession({
            expires: data.session?.expiresAt?.toISOString() ?? "", // Convert Date to ISO string
            ...data.session,
            ...data, // Spread other properties if needed
          });
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Failed to get session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // If authClient does not support onAuthStateChange, skip subscribing to auth changes.
    // You may implement polling or another mechanism here if needed.

    return () => {
      // No unsubscribe needed
    };
  }, []);

  const handleSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: provider as any,
        callbackURL: "/dashboard", // Redirect after sign in
      });
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await authClient.signOut();
      setSession(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
