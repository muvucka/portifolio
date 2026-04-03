import { useNavigate } from "react-router-dom";
import "./Login.css";
import { GiDiceFire } from "react-icons/gi";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Resposta do backend:", data); // ✅ debug do token

      if (!res.ok) {
        throw new Error(data.error || "Erro ao logar");
      }

      // ✅ salva o token no localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);      // se você quiser guardar o refresh
      console.log("Token salvo no localStorage:", localStorage.getItem("accessToken"));
      window.dispatchEvent(new Event("login")); // ⚡️ evento customizado
      

      // ✅ redireciona para a home
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
      <button
        className="register-button"
        onClick={() => navigate("/register")}
      >
        Inscrever-se
      </button>

      <div className="center-box">
        <img src="/beholder.svg" alt="Beholder" width={50} height={80} />
        <h1>Olá de novo</h1>

        <form className="login-card" onSubmit={handleLogin}>
          <div>
            <h5>Entre no NAGO com seu email e senha, ou crie uma conta</h5>

            <input
              type="email"
              placeholder="Entre com seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Entre com sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <button type="submit">Entrar</button>
          </div>

          <div className="icons">
            <GiDiceFire /> <h5>Sonw</h5>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;