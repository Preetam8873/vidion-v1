import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google"; // Correct import for Google provider
import EmailProvider from "next-auth/providers/email"; // Correct import for Email provider
import { auth } from "../../../firebaseConfig"; // Adjust the path as necessary
import { signInWithEmailAndPassword } from "firebase/auth";

export default NextAuth({
  providers: [
    EmailProvider({
      server: {
        // Your SMTP server configuration
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
  },
  callbacks: {
    async signIn(user, account, profile) {
      // Handle sign-in logic here
      return true;
    },
    async session(session, user) {
      // Add user info to session
      session.user.id = user.id;
      return session;
    },
  },
}); 