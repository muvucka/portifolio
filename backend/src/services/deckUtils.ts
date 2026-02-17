// mapDeckToResponse.ts

// CommonJS require
const { prisma } = require('../prisma');

// Tipos TypeScript
type Card = {
  id: string;
  name: string;
  imageNormal?: string;
  typeLine: string;
  colors: string[];
  cmc: number;
};

type DeckCard = {
  id: string;
  quantity: number;
  card: Card;
};

type Deck = {
  id: string;
  name: string;
  deckCards: DeckCard[];
};

// Função tipada TS, mas usando CommonJS
function mapDeckToResponse(deck: Deck) {
  return {
    deck: {
      id: deck.id,
      name: deck.name,
      cardsCount: deck.deckCards.reduce((sum: number, dc: DeckCard) => sum + dc.quantity, 0),
    },
    cards: deck.deckCards.map((dc: DeckCard) => ({
      id: dc.id,
      cardId: dc.card.id,
      name: dc.card.name,
      image: dc.card.imageNormal,
      quantity: dc.quantity,
      typeLine: dc.card.typeLine,
      colors: dc.card.colors,
      cmc: dc.card.cmc,
    })),
  };
}

module.exports = { mapDeckToResponse };
