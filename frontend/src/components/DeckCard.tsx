import type { Deck } from "../types/Deck";

interface DeckCardProps {
    deck: Deck;
}

export function DeckCard ({ deck }: DeckCardProps){
    return (
        <div className="card">
            <img
                src={deck.coverImage || "/placeholder-card.png"}
                alt={deck.name}
                className="card-image"/>
            <strong>{deck.name}</strong>
            {deck.cardsCount && <span>{deck.cardsCount} cartas</span>}
        </div>
    )
}