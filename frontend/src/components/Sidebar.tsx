// components/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GiEvilBook, GiSpellBook, GiGoblinCamp } from "react-icons/gi";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  // Estado que acompanha se o usuário está logado
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem("token"))
  );

  // Atualiza o estado caso token seja adicionado ou removido em outro lugar
  useEffect(() => {
    const handleStorage = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
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
                      <GiGoblinCamp />
                  </div>
                  Inicio
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
              Home
            </NavLink>
            <NavLink
              to="/deck"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              Decks
            </NavLink>

            <button className="nav-item logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </aside>
  );
}