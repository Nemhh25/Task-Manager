import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../lib/api";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Erro ao criar conta");
        return;
      }

      navigate("/login");
    } catch {
      setError("Não foi possível conectar ao servidor");
    }
  }

  return (
    <div className="app">
      <h1>Criar conta</h1>

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

        <button type="submit">Criar conta</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <Link to="/login">Já tem conta? Entrar</Link>
    </div>
  );
}

export default Register;