import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProviders, signIn, useSession } from "next-auth/react";
import { AUTH_MODE, consumeFlashMessage } from "../lib/auth";
import Toast from "../components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [providers, setProviders] = useState({});
  const [toast, setToast] = useState({ message: "", type: "ok" });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/users");
      return;
    }

    const flash = consumeFlashMessage();
    if (flash?.message) {
      setToast(flash);
    }

    if (AUTH_MODE === "oidc") {
      getProviders().then((availableProviders) => {
        setProviders(availableProviders || {});
      });
    }
  }, [router, status]);

  async function loginWithOidc(providerId) {
    setLoadingProvider(providerId);
    await signIn(providerId, { callbackUrl: "/users" });
  }

  const orderedProviderIds = ["keycloak", "google", "azure-ad"].filter((providerId) => providers[providerId]);
  const providerLabels = {
    keycloak: "Iniciar sesion con Keycloak",
    google: "Iniciar sesion con Google",
    "azure-ad": "Iniciar sesion con Microsoft Entra ID",
  };

  const providerHint = orderedProviderIds.length
    ? `Proveedores configurados: ${orderedProviderIds.join(", ")}`
    : "No hay proveedores OIDC disponibles. Revisa variables de entorno.";

  if (status === "authenticated") {
    return null;
  }

  return (
    <main>
      <section className="container">
        <header className="header">
          <h1>Login - Ruta protegida</h1>
          <p>
            {AUTH_MODE === "oidc"
              ? "SSO multi proveedor con NextAuth (Keycloak, Google, Entra ID)"
              : "Configura NEXT_PUBLIC_AUTH_MODE=oidc para este laboratorio."}
          </p>
        </header>

        <div className="panel auth-panel">
          <div className="auth-provider-buttons">
            {orderedProviderIds.map((providerId) => {
              const isLoading = loadingProvider === providerId;
              return (
                <button
                  key={providerId}
                  type="button"
                  onClick={() => loginWithOidc(providerId)}
                  disabled={Boolean(loadingProvider) || AUTH_MODE !== "oidc"}
                  aria-busy={isLoading}
                >
                  {isLoading ? "Redirigiendo al proveedor..." : providerLabels[providerId] || `Iniciar sesion con ${providerId}`}
                </button>
              );
            })}
          </div>
          {!orderedProviderIds.length ? <p className="helper">No hay proveedores habilitados.</p> : null}
          <p className="helper">Flujo: Authorization Code + PKCE (NextAuth)</p>
          <p className="helper">{providerHint}</p>
        </div>
      </section>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "ok" })} />
    </main>
  );
}
