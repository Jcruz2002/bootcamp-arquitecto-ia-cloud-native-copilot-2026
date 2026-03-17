import { useEffect } from "react";
import { useRouter } from "next/router";
import { getToken } from "../lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/users");
      return;
    }
    router.replace("/login");
  }, [router]);

  return (
    <main>
      <section className="container">
        <header className="header">
          <h1>Lab 05 - Next 16 conectado a API</h1>
          <p>Redirigiendo...</p>
        </header>
      </section>
    </main>
  );
}
