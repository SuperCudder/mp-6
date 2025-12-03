import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const {handlers, auth, signIn, signOut} = NextAuth ({
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
            authorization: {
                params: {
                    scope: "read:user user:email", /* basic read only perms*/
                },
            },
        })
    ],
    callbacks: {
        /* save access token for later */
        async jwt({token, account, profile}) {
            if (account) {
                token.accessToken = account.access_token;
                token.profile = profile;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.user = { ...session.user, ...(token.profile as Record<string, unknown>) };
            return session;
        }
    }
})