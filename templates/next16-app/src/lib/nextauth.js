import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import KeycloakProvider from "next-auth/providers/keycloak";

const KEYCLOAK_ISSUER = process.env.NEXTAUTH_KEYCLOAK_ISSUER || "http://localhost:18082/realms/bootcamp";
const KEYCLOAK_CLIENT_ID = process.env.NEXTAUTH_KEYCLOAK_CLIENT_ID || "enrollmenthub-spa";
const KEYCLOAK_CLIENT_SECRET = process.env.NEXTAUTH_KEYCLOAK_CLIENT_SECRET || "";

const GOOGLE_CLIENT_ID = process.env.NEXTAUTH_GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.NEXTAUTH_GOOGLE_CLIENT_SECRET || "";

const ENTRA_CLIENT_ID = process.env.NEXTAUTH_ENTRA_CLIENT_ID || "";
const ENTRA_CLIENT_SECRET = process.env.NEXTAUTH_ENTRA_CLIENT_SECRET || "";
const ENTRA_TENANT_ID = process.env.NEXTAUTH_ENTRA_TENANT_ID || "common";

const ADMIN_EMAILS = new Set(
  (process.env.NEXTAUTH_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);
const GOOGLE_ADMIN_DOMAIN = (process.env.NEXTAUTH_GOOGLE_ADMIN_DOMAIN || "").trim().toLowerCase();
const GOOGLE_STUDENT_DOMAIN = (process.env.NEXTAUTH_GOOGLE_STUDENT_DOMAIN || "").trim().toLowerCase();

function normalizeRole(value) {
  return String(value || "").trim().toLowerCase();
}

function extractRoles(payload, provider) {
  const roles = new Set();

  const profileRoles = Array.isArray(payload?.roles) ? payload.roles : [];
  profileRoles.forEach((value) => roles.add(normalizeRole(value)));

  if (typeof payload?.role === "string") {
    roles.add(normalizeRole(payload.role));
  }

  if (provider === "keycloak") {
    const realmRoles = payload?.realm_access?.roles || [];
    const clientRoles = Object.values(payload?.resource_access || {}).flatMap((entry) => entry?.roles || []);
    [...realmRoles, ...clientRoles].forEach((value) => roles.add(normalizeRole(value)));
  }

  const email = String(payload?.email || "").toLowerCase();
  if (email && ADMIN_EMAILS.has(email)) {
    roles.add("admin");
  }

  if (provider === "google" && email.includes("@")) {
    const [, domain = ""] = email.split("@");
    const normalizedDomain = domain.toLowerCase();
    if (GOOGLE_ADMIN_DOMAIN && normalizedDomain === GOOGLE_ADMIN_DOMAIN) {
      roles.add("admin");
    }
    if (GOOGLE_STUDENT_DOMAIN && normalizedDomain === GOOGLE_STUDENT_DOMAIN) {
      roles.add("student");
    }
  }

  return [...roles].filter(Boolean);
}

async function refreshAccessToken(token) {
  if (token.provider !== "keycloak") {
    return { ...token, error: "AccessTokenExpired" };
  }

  if (!token.refreshToken) {
    return { ...token, error: "NoRefreshToken" };
  }

  try {
    const tokenEndpoint = `${token.issuer || KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: token.clientId || KEYCLOAK_CLIENT_ID,
    });

    if (token.clientSecret || KEYCLOAK_CLIENT_SECRET) {
      params.set("client_secret", token.clientSecret || KEYCLOAK_CLIENT_SECRET);
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
      clientId: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_CLIENT_SECRET || "",
      issuer: KEYCLOAK_ISSUER,
      checks: ["pkce", "state"],
      authorization: { params: { scope: "openid profile email" } },
      client: KEYCLOAK_CLIENT_SECRET
        ? undefined
        : {
            token_endpoint_auth_method: "none",
          },
    }),
    ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "openid profile email",
              },
            },
          }),
        ]
      : []),
    ...(ENTRA_CLIENT_ID && ENTRA_CLIENT_SECRET
      ? [
          AzureADProvider({
            clientId: ENTRA_CLIENT_ID,
            clientSecret: ENTRA_CLIENT_SECRET,
            tenantId: ENTRA_TENANT_ID,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  debug: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.issuer = account.issuer || KEYCLOAK_ISSUER;
        token.clientId = account.provider === "keycloak" ? KEYCLOAK_CLIENT_ID : undefined;
        token.clientSecret = account.provider === "keycloak" ? KEYCLOAK_CLIENT_SECRET : undefined;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.accessTokenExpires = (account.expires_at || 0) * 1000;

        const roles = extractRoles(profile || {}, account.provider);
        token.roles = roles;
        token.preferredUsername = profile?.preferred_username || profile?.name || token.name;
        token.claims = {
          sub: profile?.sub || token.sub,
          email: profile?.email || token.email,
          preferred_username: profile?.preferred_username || "",
          provider: account.provider,
          iss: account.issuer || "",
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
      session.provider = token.provider;
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
