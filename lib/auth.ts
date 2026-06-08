import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!credentials?.email || !credentials.password || !adminEmail || (!adminPassword && !adminPasswordHash)) {
          return null;
        }

        const isEmailMatch = credentials.email.toLowerCase() === adminEmail.toLowerCase();
        const isPasswordMatch = adminPassword
          ? credentials.password === adminPassword
          : await bcrypt.compare(credentials.password, adminPasswordHash as string);

        if (!isEmailMatch || !isPasswordMatch) {
          return null;
        }

        return {
          id: "artisan-root-admin",
          email: adminEmail,
          name: "Artisan Root Admin"
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }

      return session;
    }
  }
};
