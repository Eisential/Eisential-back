import { type NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

// Validar variables de entorno críticas
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('❌ NEXTAUTH_SECRET no está definido en las variables de entorno');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  pages: {
    signIn: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/`,
    signOut: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/`,
    error: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/`,
  },

  callbacks: {
    async signIn({ account, profile }) {
      // Permitir login incluso si la cuenta no está vinculada
      return true;
    },

    async redirect({ url, baseUrl }) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      if (url.startsWith('/')) {
        return `${frontendUrl}${url}`;
      }
      
      if (url.startsWith(frontendUrl)) {
        return url;
      }
      
      return `${frontendUrl}/dashboard`;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);