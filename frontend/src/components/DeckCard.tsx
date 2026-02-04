import type { Deck } from "../types/Deck";
import "./DeckCard.css";
import { GiBehold } from "react-icons/gi";


interface DeckCardProps {
    deck: Deck;
}

export function DeckCard ({ deck }: DeckCardProps){
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

            <button className="open-button" aria-label={deck.name}>
                <GiBehold size={30} />
            </button>
        </div>
    )
}