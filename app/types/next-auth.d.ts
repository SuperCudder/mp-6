import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
    }

    interface JWT {
        accessToken?: string;
        profile?: Record<string, unknown>;
    }
}