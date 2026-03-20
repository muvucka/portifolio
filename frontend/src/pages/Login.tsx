import { useNavigate } from "react-router-dom";
import "./Login.css";
import { GiDiceFire } from "react-icons/gi";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao logar");
      }

      // 👉 depois você vai salvar o token aqui
       localStorage.setItem("token", data.token);

      navigate("/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Erro inesperado");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="top-left-icon">
        <img src="/beholder.svg" alt="Beholder" width={120} height={120} />
      </div>

      {/* ✅ corrigido */}
      <button
        className="register-button"
        onClick={() => navigate("/register")}
      >
        Inscrever-se
      </button>

      {/* ✅ corrigido */}
      <form className="login-card" onSubmit={handleLogin}>
        <div>
          <h1>Entrar</h1>
          <h5>
            Entre no NAGO com seu email e senha, ou crie uma conta
          </h5>

          <input
            type="email"
            placeholder="Entre com seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Entre com sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <button type="submit">Entrar</button>
        </div>

        <div className="icons">
          <GiDiceFire /> <h5>Snow</h5>
        </div>
      </form>
    </div>
  );
}

export default Login;