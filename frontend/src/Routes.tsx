import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Cadastro";
import Deck from "./pages/DeckList";
import Init from "./pages/init";
import AppLayout from "./AppLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Init />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/deck/:id" element={<Deck />} />
      </Route>
    </Routes>
  );
}

