import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import User from '@/models/User';

// Emails that are always granted the 'admin' role
const ADMIN_EMAILS = ['malindi.wpm@gmail.com', 'nchathuranga533@gmail.com'];

/** Derive the correct role — falls back to email check for legacy accounts that
 *  were created before the role field was added to the schema. */
function resolveRole(dbRole: string | undefined, email: string): 'admin' | 'user' {
  if (dbRole === 'admin') return 'admin';
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin';
  return 'user';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        await dbConnect();

        // 1. Admin login via username (legacy Admin model)
        if (credentials.username) {
          const admin = await Admin.findOne({ username: credentials.username });
          if (!admin) return null;
          const isValid = await bcrypt.compare(credentials.password, admin.password);
          if (!isValid) return null;
          return { id: admin._id.toString(), name: admin.username, email: '', role: 'admin' as const };
        }

        // 2. User login via email — open to all registered users
        if (credentials.email) {
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          if (!user) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          // Use resolveRole so existing accounts without a role field still work
          const role = resolveRole(user.role, user.email);

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role,
          };
        }

        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = (token.role ?? 'user') as 'admin' | 'user';
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
