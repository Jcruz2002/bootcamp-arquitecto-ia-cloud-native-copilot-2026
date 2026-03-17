import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DEFAULT_API_BASE, clearSession, consumeFlashMessage, getToken, setFlashMessage } from "../lib/auth";
import Toast from "../components/Toast";

const ENDPOINT = `${DEFAULT_API_BASE}/api/v1/users`;

export default function UsersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [token, setTokenState] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toast, setToast] = useState({ message: "", type: "ok" });

  function showToast(message, type = "ok") {
    setToast({ message, type });
  }

  useEffect(() => {
    const sessionToken = getToken();
    if (!sessionToken) {
      router.replace("/login");
      return;
    }

    const flash = consumeFlashMessage();
    if (flash?.message) {
      setToast(flash);
    }

    setTokenState(sessionToken);
    setReady(true);
  }, [router]);

  function handleUnauthorized() {
    clearSession();
    router.replace("/login");
  }

  async function loadUsers(sessionToken) {
    setLoadingUsers(true);
    setError("");

    try {
      const response = await fetch(`${ENDPOINT}?skip=0&take=20`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) throw new Error(`Error al listar usuarios (${response.status})`);

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudo cargar el listado");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEdit = editingUser !== null;
      const url = isEdit ? `${ENDPOINT}/${editingUser.id}` : ENDPOINT;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });

      if (response.status === 401) { handleUnauthorized(); return; }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.message || `Error ${response.status}`);
      }

      setName("");
      setEmail("");
      setEditingUser(null);
      const msg = isEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente";
      setSuccess(msg);
      showToast(msg, "ok");
      await loadUsers(token);
    } catch (err) {
      setError(err.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(user) {
    if (!confirm(`¿Eliminar a "${user.name}"?`)) return;
    setDeletingId(user.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${ENDPOINT}/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) throw new Error(`No se pudo eliminar (${response.status})`);

      const msg = `Usuario "${user.name}" eliminado correctamente`;
      setSuccess(msg);
      showToast(msg, "ok");
      if (editingUser?.id === user.id) onCancelEdit();
      await loadUsers(token);
    } catch (err) {
      setError(err.message || "No se pudo eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  function onEdit(user) {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setSuccess("");
    setError("");
  }

  function onCancelEdit() {
    setEditingUser(null);
    setName("");
    setEmail("");
    setSuccess("");
    setError("");
  }

  function onLogout() {
    clearSession();
    setFlashMessage("Sesión cerrada correctamente", "ok");
    router.push("/login");
  }

  useEffect(() => {
    if (!ready || !token) return;
    loadUsers(token);
  }, [ready, token]);

  if (!ready) {
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

  const isEdit = editingUser !== null;

  return (
    <main>
      <section className="container">
        <header className="header header-with-actions">
          <div>
            <h1>Lab 05 - Gestión de usuarios</h1>
            <p>CRUD completo con JWT del Lab 03.</p>
          </div>
          <button onClick={onLogout}>Cerrar sesión</button>
        </header>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "ok" })} />

        <div className="grid">
          <aside className="panel">
            <h2>{isEdit ? `Editando: ${editingUser.name}` : "Nuevo usuario"}</h2>
            <form onSubmit={onSubmit}>
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Perez"
                required
                minLength={3}
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@demo.com"
                required
              />

              <button type="submit" disabled={saving}>
                {saving ? "Guardando..." : isEdit ? "Actualizar" : "Crear usuario"}
              </button>

              {isEdit && (
                <button type="button" className="btn-secondary" onClick={onCancelEdit}>
                  Cancelar
                </button>
              )}
            </form>

            {success ? <p className="message ok">{success}</p> : null}
            {error ? <p className="message error">{error}</p> : null}
          </aside>

          <section className="panel">
            <div className="toolbar">
              <h2>Usuarios</h2>
              <button onClick={() => loadUsers(token)} disabled={loadingUsers}>
                {loadingUsers ? "Cargando..." : "Refrescar"}
              </button>
            </div>

            {loadingUsers ? <p>Cargando listado...</p> : null}

            {!loadingUsers && users.length === 0 ? (
              <p>No hay usuarios todavía.</p>
            ) : (
              <ul className="list">
                {users.map((user) => (
                  <li key={user.id} className={`card${editingUser?.id === user.id ? " card-editing" : ""}`}>
                    <div className="card-body">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <p>Estado: {user.status || "active"}</p>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(user)}
                        disabled={deletingId === user.id}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => onDelete(user)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
