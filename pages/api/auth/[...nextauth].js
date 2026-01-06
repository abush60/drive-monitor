import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * アクセストークンをリフレッシュする関数
 */
async function refreshAccessToken(token) {
    try {
        const url = 'https://oauth2.googleapis.com/token';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('トークンのリフレッシュに失敗:', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/drive',
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // 初回ログイン時
            if (account) {
                return {
                    accessToken: account.access_token,
                    accessTokenExpires: Date.now() + account.expires_in * 1000,
                    refreshToken: account.refresh_token,
                    user: token.user,
                };
            }

            // アクセストークンがまだ有効な場合
            if (Date.now() < token.accessTokenExpires) {
                return token;
            }

            // アクセストークンの有効期限が切れた場合、リフレッシュ
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.error = token.error;
            return session;
        },
    },
    pages: {
        signIn: '/',
    },
};

export default NextAuth(authOptions);
