import KeycloakProvider from "next-auth/providers/keycloak";

const OIDC_ISSUER = process.env.NEXTAUTH_OIDC_ISSUER || "http://localhost:18082/realms/bootcamp";
const OIDC_CLIENT_ID = process.env.NEXTAUTH_OIDC_CLIENT_ID || "enrollmenthub-spa";
const OIDC_CLIENT_SECRET = process.env.NEXTAUTH_OIDC_CLIENT_SECRET || "";

function extractRoles(payload) {
  const realmRoles = payload?.realm_access?.roles || [];
  const clientRoles = Object.values(payload?.resource_access || {}).flatMap((entry) => entry?.roles || []);
  return [...new Set([...realmRoles, ...clientRoles])];
}

async function refreshAccessToken(token) {
  if (!token.refreshToken) {
    return { ...token, error: "NoRefreshToken" };
  }

  try {
    const tokenEndpoint = `${OIDC_ISSUER}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: OIDC_CLIENT_ID,
    });

    if (OIDC_CLIENT_SECRET) {
      params.set("client_secret", OIDC_CLIENT_SECRET);
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const refreshed = await response.json();
    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in || 300) * 1000,
      refreshToken: refreshed.refresh_token || token.refreshToken,
      idToken: refreshed.id_token || token.idToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: OIDC_CLIENT_ID,
      clientSecret: OIDC_CLIENT_SECRET || "",
      issuer: OIDC_ISSUER,
      checks: ["pkce", "state"],
      authorization: { params: { scope: "openid profile email" } },
      client: OIDC_CLIENT_SECRET
        ? undefined
        : {
            token_endpoint_auth_method: "none",
          },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  debug: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.accessTokenExpires = (account.expires_at || 0) * 1000;

        const roles = extractRoles(profile || {});
        token.roles = roles;
        token.preferredUsername = profile?.preferred_username || profile?.name || token.name;
        token.claims = {
          sub: profile?.sub || token.sub,
          email: profile?.email || token.email,
          preferred_username: profile?.preferred_username || "",
          realm_roles: profile?.realm_access?.roles || [],
        };
        return token;
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.roles = token.roles || [];
      session.user = {
        ...session.user,
        name: token.preferredUsername || session.user?.name || "",
        email: token.email || session.user?.email || "",
      };
      session.claims = token.claims || {};
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      console.log("[next-auth][debug]", code, metadata);
    },
  },
};
