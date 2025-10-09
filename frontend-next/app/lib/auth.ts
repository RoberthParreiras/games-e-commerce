import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiFetch } from "../api/fetch";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password } = credentials;

        const res = await apiFetch("/api/auth/login", {
          method: "POST",
          body: { email, password },
          headers: { "Content-Type": "application/json" },
          isAuthRoute: true,
        });

        if (!res || !res.ok) {
          console.error("Failed to login:", await res.text());
          return null;
        }

        const data = await res.json();
        // If we received a token, create a user object.
        if (data && data.access_token) {
          const payloadBase64 = data.access_token.split(".")[1];
          const decodedPayload = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString(),
          );

          return {
            id: decodedPayload.sub, // User ID from 'sub' claim in JWT
            name: decodedPayload.userName,
            email: email, // The email is not in the token, so we use the one from credentials
            accessToken: data.access_token,
            accessTokenExpires: decodedPayload.exp,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // user is only available on sign-in
      if (user) {
        const tokenExpiresInMiliseconds = user.accessTokenExpires! * 1000;

        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name;
        token.backendTokenExpires = tokenExpiresInMiliseconds;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }

      if (token.backendTokenExpires) {
        session.accessTokenExpires = token.backendTokenExpires as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
