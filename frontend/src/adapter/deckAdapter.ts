// src/adapters/deckAdapter.ts

export interface ApiCard {
  id: string;
  name: string;
  typeLine: string;
  cmc: number;
  imageNormal?: string;
  imageArtCrop?: string;
  colors: { value: string }[];
  colorIdentities: { value: string }[];
}

export interface ApiDeck {
  id: string;
  name: string;
  format: string;
  commander: ApiCard | null;
  deckCards: {
    id: string;
    quantity: number;
    card: ApiCard;
  }[];
  updatedAt: string;
  section: "meus" | "proximos";
}

export function mapApiDeckToUI(deck: ApiDeck) {
  const deckCards = deck.deckCards ?? [];

  const cards = deckCards.map(dc => ({
    id: dc.id,
    cardId: dc.card?.id ?? "",
    name: dc.card?.name ?? "",
    image: dc.card?.imageNormal ?? "",
    quantity: dc.quantity,
    typeLine: dc.card?.typeLine ?? "",
    cmc: dc.card?.cmc ?? 0,
    colors: dc.card?.colorIdentities?.map(c => c.value) ?? [],
    isCommander: dc.card?.id === deck.commander?.id,
  }));

  return {
    deck: {
      id: deck.id,
      name: deck.name,
      coverImage: deck.commander?.imageArtCrop,
      cardsCount: cards.reduce((sum, c) => sum + c.quantity, 0),
      format: deck.format,
      updatedAt: deck.updatedAt,
      section: deck.section,
    },
    cards,
  };
}