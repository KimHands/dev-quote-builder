import NextAuth from "next-auth";
import Kakao from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Kakao],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.role = user.role ?? "user";
      }
      return session;
    },
  },
});
