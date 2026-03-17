import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  AUTH_MODE,
  DEFAULT_API_BASE,
  OIDC_AUTHORITY,
  OIDC_CLIENT_ID,
  consumeFlashMessage,
  getToken,
  setFlashMessage,
  setToken,
} from "../lib/auth";
import Toast from "../components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "ok" });

  useEffect(() => {
    if (AUTH_MODE === "oidc" && typeof window !== "undefined" && window.location.hash?.includes("access_token=")) {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setToken(accessToken);
        window.history.replaceState({}, document.title, "/login");
        setFlashMessage("Login OIDC exitoso", "ok");
        router.replace("/users");
        return;
      }
    }

    if (getToken()) {
      router.replace("/users");
      return;
    }

    const flash = consumeFlashMessage();
    if (flash?.message) {
      setToast(flash);
    }
  }, [router]);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.message || `No se pudo iniciar sesión (${response.status})`);
      }

      if (!body.accessToken) {
        throw new Error("La API no devolvió un accessToken válido");
      }

      setToken(body.accessToken);
      setFlashMessage("¡Inicio de sesión exitoso!", "ok");
      router.push("/users");
    } catch (err) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  }

  function loginWithOidc() {
    if (typeof window === "undefined") return;
    const redirectUri = `${window.location.origin}/login`;
    const state = Math.random().toString(36).slice(2);
    const authUrl = new URL(`${OIDC_AUTHORITY}/protocol/openid-connect/auth`);
    authUrl.searchParams.set("client_id", OIDC_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "token");
    authUrl.searchParams.set("scope", "openid profile email");
    authUrl.searchParams.set("state", state);
    window.location.href = authUrl.toString();
  }

  return (
    <main>
      <section className="container">
        <header className="header">
          <h1>Login - Ruta protegida</h1>
          <p>{AUTH_MODE === "oidc" ? "Login federado OIDC (Keycloak)" : "Usa credenciales del Lab 03 para obtener JWT."}</p>
        </header>

        <div className="panel auth-panel">
          {AUTH_MODE === "oidc" ? (
            <>
              <button type="button" onClick={loginWithOidc}>Iniciar sesión con OIDC</button>
              <p className="helper">Proveedor: {OIDC_AUTHORITY}</p>
              <p className="helper">Cliente: {OIDC_CLIENT_ID}</p>
            </>
          ) : (
          <form onSubmit={onSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
          )}

          <p className="helper">Credenciales demo local: admin / password</p>
          {error ? <p className="message error">{error}</p> : null}
        </div>
      </section>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "ok" })} />
    </main>
  );
}
