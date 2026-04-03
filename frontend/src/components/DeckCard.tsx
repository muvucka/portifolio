import type { Deck } from "../types/Deck";
import "./DeckCard.css";
import { GiBehold, GiTurd } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface DeckCardProps {
  deck: Deck;
  onDelete?: (id: string) => void;
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const handleDeleteDeck = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(`Deletar o deck "${deck.name}"?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não logado");

      const res = await fetch(`http://portifolio-production-539d.up.railway.app/decks/${deck.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Erro ao deletar deck: ${res.status}`);

      alert("Deck deletado com sucesso!");

      setVisible(false);
      onDelete?.(deck.id);
    } catch (error) {
      console.error("Erro ao deletar deck:", error);
      alert("Erro ao deletar deck");
    }
  };

 const handleOpenDeck = () => {
  localStorage.setItem("lastDeckId", deck.id);
  window.dispatchEvent(new Event("deckChange"));
  navigate(`/deck/${deck.id}`);
};

  if (!visible) return null;

  return (
    <div className="card">
      <img
        src={deck.coverImage || "/placeholder-card.png"}
        alt={deck.name}
        className="card-image"
      />

      <div className="card-info">
        <strong className="card-title">{deck.name}</strong>
        {deck.cardsCount && <span>{deck.cardsCount} cartas</span>}
      </div>

      <button
        type="button"
        onClick={handleOpenDeck}
        className="open-button"
      >
        <GiBehold size={30} />
      </button>

      <button
        type="button"
        onClick={handleDeleteDeck}
        className="delete-button"
      >
        <GiTurd size={20} />
      </button>
    </div>
  );
}