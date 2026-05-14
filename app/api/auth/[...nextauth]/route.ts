import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // Used during registration
        isRegistering: { label: "Is Registering", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        if (credentials.isRegistering === 'true') {
          if (user) {
            throw new Error("Email already exists");
          }
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await User.create({
            email: credentials.email,
            password: hashedPassword,
            role: credentials.role || 'citizen',
          });
          return { id: newUser._id.toString(), email: newUser.email, role: newUser.role };
        } else {
          if (!user || !user.password) {
            throw new Error("User not found");
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid password");
          }
          return { id: user._id.toString(), email: user.email, role: user.role };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
