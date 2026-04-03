import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cadastro.css";
import { GiDiceFire } from "react-icons/gi";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const API = import.meta.env.VITE_API_URL;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar");
      }

      alert("Conta criada com sucesso!");
      navigate("/login");
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Erro inesperado");
      }
    } // ✅ fecha o catch
  } // ✅ fecha a função

  return (
    <div className="register-page">
      <div className="center-register">
        <img src="/beholder.svg" alt="Beholder" width={50} height={80} />
          <h1>Se increva e comece a usar o NAGO</h1>

      <form className="register-card" onSubmit={handleRegister}>
        <div>
          <h5>Crie uma conta nova no NAGO com seu email e senha</h5>

          <input
            type="email"
            placeholder="Cadastre um novo email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Cadastre uma nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div>
          <button type="submit">Cadastrar</button>
        </div>

        <div className="icons">
          <GiDiceFire /> <h5>Sonw</h5>
        </div>
      </form>
      </div>
      </div>
  );
}

export default Register;