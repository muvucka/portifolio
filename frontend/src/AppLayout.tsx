// AppLayout.tsx
import Sidebar from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import "./AppLayout.css"; // opcional para estilos responsivos

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <Outlet /> {/* Aqui entram todas as páginas protegidas */}
      </main>
    </div>
  );
}