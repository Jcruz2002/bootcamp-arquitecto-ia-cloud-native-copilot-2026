import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { AUTH_MODE, consumeFlashMessage } from "../lib/auth";
import Toast from "../components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
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
  }, [router, status]);

  async function loginWithOidc() {
    setLoading(true);
    await signIn("keycloak", { callbackUrl: "/users" });
  }

  return (
    <main>
      <section className="container">
        <header className="header">
          <h1>Login - Ruta protegida</h1>
          <p>{AUTH_MODE === "oidc" ? "Login federado OIDC con NextAuth" : "Configura NEXT_PUBLIC_AUTH_MODE=oidc para este laboratorio."}</p>
        </header>

        <div className="panel auth-panel">
          <button type="button" onClick={loginWithOidc} disabled={loading || AUTH_MODE !== "oidc"}>
            {loading ? "Redirigiendo al proveedor..." : "Iniciar sesión con OIDC"}
          </button>
          <p className="helper">Flujo: Authorization Code + PKCE (NextAuth)</p>
        </div>
      </section>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "ok" })} />
    </main>
  );
}
