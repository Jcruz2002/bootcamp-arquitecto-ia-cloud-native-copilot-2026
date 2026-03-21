import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

const discovery = {
  authorizationEndpoint:
    process.env.EXPO_PUBLIC_OIDC_AUTH_URL ||
    'http://localhost:18082/realms/bootcamp/protocol/openid-connect/auth',
  tokenEndpoint:
    process.env.EXPO_PUBLIC_OIDC_TOKEN_URL ||
    'http://localhost:18082/realms/bootcamp/protocol/openid-connect/token',
};

const CLIENT_ID = process.env.EXPO_PUBLIC_OIDC_CLIENT_ID || 'mobile-app';

export async function login() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'mobileapp' });

  const request = new AuthSession.AuthRequest({
    clientId: CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
    usePKCE: true,
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== 'success') {
    throw new Error('Login cancelled or failed');
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier! },
      clientId: CLIENT_ID,
    },
    discovery
  );

  if (tokenResponse.accessToken) {
    await SecureStore.setItemAsync('access_token', tokenResponse.accessToken);
  }

  return tokenResponse;
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync('access_token');
}

export async function logout() {
  await SecureStore.deleteItemAsync('access_token');
}
