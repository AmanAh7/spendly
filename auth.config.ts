import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isDashboardRoute =
        request.nextUrl.pathname.startsWith("/dashboard");

      if (isDashboardRoute) {
        return isLoggedIn;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
