import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DEFAULT_API_BASE, consumeFlashMessage, getToken, setFlashMessage, setToken } from "../lib/auth";
import Toast from "../components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "ok" });

  useEffect(() => {
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

  return (
    <main>
      <section className="container">
        <header className="header">
          <h1>Login - Ruta protegida</h1>
          <p>Usa credenciales del Lab 03 para obtener JWT.</p>
        </header>

        <div className="panel auth-panel">
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

          <p className="helper">Credenciales demo: admin / password</p>
          {error ? <p className="message error">{error}</p> : null}
        </div>
      </section>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "ok" })} />
    </main>
  );
}
