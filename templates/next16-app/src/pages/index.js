import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/users");
      return;
    }
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  return (
    <main>
      <section className="container">
        <header className="header">
          <h1>Lab 18 - SSO OIDC multi proveedor</h1>
          <p>Redirigiendo...</p>
        </header>
      </section>
    </main>
  );
}
