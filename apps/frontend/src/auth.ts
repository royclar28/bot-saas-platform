import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                if (!process.env.ADMIN_PASSWORD) {
                    console.error("ADMIN_PASSWORD is not set in environment variables");
                    return null;
                }

                if (credentials.password === process.env.ADMIN_PASSWORD) {
                    // Return a user object on success
                    return { id: "1", name: "Admin", email: "admin@gabystore.com" };
                }
                return null;
            },
        }),
    ],
});
