import { db } from "@acme/db/client";
import { oAuthProxy } from "better-auth/plugins";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env";
import { expo } from "@better-auth/expo";
import * as AuthSession from "expo-auth-session";

// Update the redirect URI configuration to use proxy
const redirectURI = AuthSession.makeRedirectUri({
  scheme: "everynote",
});

// Debug line to see the generated URI
console.log("Redirect URI:", redirectURI);

export const config = {
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: env.AUTH_SECRET,
  plugins: [oAuthProxy(), expo()],
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      redirectURI,
    },
  },
  trustedOrigins: [
    "https://auth.expo.io", // Expo auth proxy
    "exp://", // Dev client
    redirectURI, // Add the generated redirect URI
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session;
