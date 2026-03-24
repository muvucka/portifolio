import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Section } from "../components/Section";
import { mapDeckListToUI } from "../adapter/deckListAdapter";
import type { Deck } from "../types/Deck";
import "../pages/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);

async function fetchDecks() {
    try {
          const token = localStorage.getItem("accessToken");
          if (!token) throw new Error("Usuário não está logado");

      const res = await fetch("http://localhost:3000/decks", {
        headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
      });

      console.log("Status da resposta:", res.status, res.statusText);

      if (!res.ok) {
        throw new Error(`Erro ao buscar decks: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setDecks(mapDeckListToUI(data)); // Certifique-se de que 'mapDeckListToUI' está adaptado para seu uso
    } catch (err) {
      console.error("Erro ao carregar decks:", err);
    }
  }

  useEffect(() => {
    fetchDecks();
  }, []); // Adiciona este log para depuração

  return (
    <div className="home">
      <main className="content-wrapper">
        <div className="content-card">
          <Section title="Decks Recentes" itens={decks} />
          <Section title="Decks Precons" itens={decks} />
          <Section title="Decks Custom" itens={decks} />
        </div>

        <section>
          <button onClick={() => navigate("/deck/create")}>
            Adicionar Deck
          </button>
        </section>
      </main>
    </div>
  );
}