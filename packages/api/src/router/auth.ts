// packages/api/src/router/auth.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { users } from "@acme/db/schema";

// Google OAuth token exchange
async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const tokenEndpoint = "https://oauth2.googleapis.com/token";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

// Get Google user profile
async function getGoogleUserProfile(accessToken: string) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  return response.json();
}

export const authRouter = createTRPCRouter({
  googleSignIn: publicProcedure
    .input(
      z.object({
        code: z.string(),
        redirectUri: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Exchange authorization code for tokens
        const tokens = await exchangeCodeForTokens(
          input.code,
          input.redirectUri,
        );

        // Get user profile from Google
        const googleUser = await getGoogleUserProfile(tokens.access_token);

        // Check if user exists in your database
        let user = await ctx.db.query.users.findFirst({
          where: eq(users.email, googleUser.email),
        });

        // Create user if doesn't exist
        if (!user) {
          const [newUser] = await ctx.db
            .insert(users)
            .values({
              email: googleUser.email,
              name: googleUser.name,
              image: googleUser.picture,
              googleId: googleUser.id,
            })
            .returning();
          user = newUser!;
        } else {
          // Update existing user with Google ID if not set
          if (!user.googleId) {
            const [updatedUser] = await ctx.db
              .update(users)
              .set({ googleId: googleUser.id })
              .where(eq(users.id, user.id))
              .returning();
            user = updatedUser!;
          }
        }

        // Create JWT token for your app
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" },
        );

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          },
          token,
        };
      } catch (error) {
        console.error("Google sign-in error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to authenticate with Google",
        });
      }
    }),

  // Optional: Refresh token endpoint
  refreshToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, process.env.JWT_SECRET!) as any;

        // Generate new token
        const newToken = jwt.sign(
          {
            userId: decoded.userId,
            email: decoded.email,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" },
        );

        return { token: newToken };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }
    }),
});
