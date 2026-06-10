import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message ?? 'Login failed');
          }

          return {
            id: (data.data.user as { id: string }).id,
            email: (data.data.user as { email: string }).email,
            name: (data.data.user as { name: string }).name,
            image: (data.data.user as { avatarUrl?: string }).avatarUrl ?? null,
            accessToken: data.data.accessToken,
            role: (data.data.user as { role: string }).role,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : 'Authentication failed');
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.role = (user as { role?: string }).role ?? 'USER';
        token.userId = user.id;
      }
      if (account?.provider === 'google') {
        // Handle Google OAuth - get token from backend
        try {
          const response = await fetch(`${API_BASE}/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: account.providerAccountId,
              email: token.email,
              name: token.name,
              avatarUrl: token.picture,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            token.accessToken = data.data?.accessToken;
          }
        } catch {}
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.userId as string,
        role: token.role as string,
      } as typeof session.user & { id: string; role: string };
      (session as typeof session & { accessToken?: string }).accessToken = token.accessToken as string;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};
