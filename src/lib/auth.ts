import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// User storage - in production, use a real database
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// In-memory user store (will reset on server restart)
// In production, replace with database
let users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', password: 'admin123' },
];

// Function to get all users
export function getUsers(): User[] {
  return users;
}

// Function to add a new user
export function addUser(name: string, email: string, password: string): User | null {
  // Check if user already exists
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return null;
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
  };

  users.push(newUser);
  return newUser;
}

// Function to find user by email and password
export function findUser(email: string, password: string): User | undefined {
  return users.find((u) => u.email === email && u.password === password);
}

// Function to check if email exists
export function emailExists(email: string): boolean {
  return users.some((u) => u.email === email);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = findUser(credentials.email, credentials.password);

        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
