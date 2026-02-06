import type { Deck } from '../types/Deck';
import "../components/DeckHeader.css"

interface DeckHeaderProps {
  deck: Deck;
}
export function DeckHeader({ deck }: DeckHeaderProps) {
  console.log('Deck coverImage:', deck.coverImage);
  const lastUpdated = new Date(deck.lastUpdatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="deckheader"
      style={{
        '--deck-cover': `url(${deck.coverImage})`,
      } as React.CSSProperties}
    >
      <div className="deckheader-content">
        <div className="deckheader-container">
          <h1 className="deckheader-name">{deck.name}</h1>
          <span className="deck-category-badge">
            {deck.category}
          </span>

          <div className="deckheader-meta">
            <span>{deck.cardsCount} cards</span>
            <span className="deckheader-updated">
               Last updated {lastUpdated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
