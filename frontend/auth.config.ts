import type { NextAuthConfig } from 'next-auth';


export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Store user name and role into JWT token on sign in.
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    // Add user name and role to the session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      //console.log(auth?.user);
      //Make the role == user only have access to /dashboard and /edit
      if (auth?.user.role === 'user') {
        const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
        const isOnEdit = nextUrl.pathname.startsWith('/edit');
        if (isOnDashboard || isOnEdit) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
        } else if (isLoggedIn) {
          return Response.redirect(new URL('/edit', nextUrl));
        }
        return true;
      }
      //Make the role == admin have access to all pages if logged in
      if (auth?.user.role === 'admin') {
        if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
      }
    },
  },
  providers: [], // Add providers as needed
};