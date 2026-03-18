import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return (
      <main>
        <section className="container">
          <header className="header">
            <h1>Validando sesión</h1>
            <p>Espera un momento...</p>
          </header>
        </section>
      </main>
    );
  }

  const roles = session?.roles || [];
  const isAdmin = roles.includes("admin");

  return (
    <main>
      <section className="container">
        <header className="header header-with-actions">
          <div>
            <h1>Panel Admin</h1>
            <p>Validación de acceso por rol en frontend.</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}>Cerrar sesión</button>
        </header>

        <div className="panel">
          <p className="helper">Usuario: {session?.user?.name || "-"}</p>
          <p className="helper">Roles detectados: {roles.length ? roles.join(", ") : "sin roles"}</p>

          {isAdmin ? (
            <p className="message ok">Acceso permitido: rol admin detectado.</p>
          ) : (
            <p className="message error">Acceso denegado: falta rol admin.</p>
          )}

          <p>
            <Link href="/users">Volver a usuarios</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
