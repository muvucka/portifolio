import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  GiEvilBook,
  GiSpellBook,
  GiGoblinCamp,
  GiDelighted,
  GiCardJoker,
} from "react-icons/gi";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem("accessToken"))
  );

const [lastDeckId, setLastDeckId] = useState<string | null>(
  localStorage.getItem("lastDeckId")
);
useEffect(() => {
  const handleLoginEvent = () =>
    setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));

  const handleStorage = () =>
    setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));

  const handleDeckChange = () => {
    setLastDeckId(localStorage.getItem("lastDeckId"));
  };

  window.addEventListener("login", handleLoginEvent);
  window.addEventListener("storage", handleStorage);
  window.addEventListener("deckChange", handleDeckChange);

  return () => {
    window.removeEventListener("login", handleLoginEvent);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("deckChange", handleDeckChange);
  };
}, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setLastDeckId(null);
    navigate("/login");
  }

  const isDeckActive = location.pathname.startsWith("/deck");

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/beholder.svg" alt="Beholder" width={50} height={50} />
        <h2 className="sidebar-title">NAGO</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
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
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <div className="icons">
                <GiEvilBook />
              </div>
              Entrar
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
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
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <div className="icons">
                <GiGoblinCamp />
              </div>
              Inicio
            </NavLink>

            <NavLink
              to={lastDeckId ? `/deck/${lastDeckId}` : "/home"}
              className={() =>
                isDeckActive ? "nav-item active" : "nav-item"
              }
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