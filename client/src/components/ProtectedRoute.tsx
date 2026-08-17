
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import API_URL from "../lib/api";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((res) => {
        setStatus(res.ok ? "authenticated" : "unauthenticated");
      })
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") return <p>Carregando...</p>;
  if (status === "unauthenticated") return <Navigate to="/login" />;
  return children;
}

export default ProtectedRoute;