import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../lib/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erro ao fazer login");
        return;
      }

      navigate("/tasks");
    } catch {
      setError("Não foi possível conectar ao servidor");
    }
  }

  return (
    <div className="app">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Senha</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Entrar</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <Link to="/register">Não tem conta? Criar uma</Link>
    </div>
  );
}

export default Login;