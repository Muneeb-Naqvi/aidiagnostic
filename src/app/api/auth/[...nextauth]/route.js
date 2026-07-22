import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDB } from "@/config/database";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          const db = await getDB();
          
          let patient = await db.collection("patients").findOne({ email: user.email });
          
          if (!patient) {
            const patientId = `PT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const newPatient = {
              patientId,
              name: user.name,
              email: user.email,
              image: user.image,
              authProvider: "google",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await db.collection("patients").insertOne(newPatient);
            user.patientId = patientId;
          } else {
            user.patientId = patient.patientId;
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.patientId = user.patientId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.patientId) {
        session.user.patientId = token.patientId;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/patients-login',
  }
};

const originalDateNow = Date.now;

const handler = async (req, res) => {
  // If the system clock is 12 hours ahead, JWT verification fails.
  // We temporarily offset Date.now() by -12 hours just for the Google callback request.
  const isCallback = req.url && req.url.includes("/api/auth/callback/google");
  
  if (isCallback) {
    Date.now = () => originalDateNow() - (12 * 60 * 60 * 1000); // subtract 12 hours
  }

  try {
    return await NextAuth(authOptions)(req, res);
  } finally {
    if (isCallback) {
      Date.now = originalDateNow;
    }
  }
};

export { handler as GET, handler as POST };

