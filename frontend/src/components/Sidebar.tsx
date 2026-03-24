// components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GiEvilBook, GiSpellBook, GiGoblinCamp, GiDelighted, GiCardJoker } from "react-icons/gi";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  // Estado de login inicializado com base no accessToken
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem("accessToken"))
  );

  // useEffect para escutar login/logout e alterações no localStorage
  useEffect(() => {
    // Atualiza estado quando ocorre login na mesma aba
    const handleLoginEvent = () =>
      setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));

    // Atualiza estado quando localStorage muda em outra aba
    const handleStorage = () =>
      setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));

    window.addEventListener("login", handleLoginEvent); // evento customizado
    window.addEventListener("storage", handleStorage);  // evento para outras abas

    return () => {
      window.removeEventListener("login", handleLoginEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Logout seguro
  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/beholder.svg" alt="Beholder" width={50} height={50} />
        <h2 className="sidebar-title">NAGO</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <div className="icons">
            <GiDelighted />
          </div>
          Novidades
        </NavLink>

        {!isLoggedIn && (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <div className="icons">
                <GiEvilBook />
              </div>
              Entrar
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <div className="icons">
                <GiSpellBook />
              </div>
              Inscreva-se
            </NavLink>
          </>
        )}

        {isLoggedIn && (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <div className="icons">
                <GiGoblinCamp />
              </div>
              Inicio
            </NavLink>

            <NavLink
              to="/deck"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <div className="icons">
                <GiCardJoker />
              </div>
              Decks
            </NavLink>

            <button className="nav-item logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}