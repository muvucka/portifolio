import type { Deck } from "../types/Deck";

export interface ApiDeckListItem {
  id: string;
  name: string;
  format: string;
  updatedAt: string;
  coverImage?: string | null;
  cardsCount: number;
}

export function mapDeckListToUI(data: ApiDeckListItem[]): Deck[] {
  return data.map(deck => ({
    id: deck.id,
    name: deck.name,
    coverImage: deck.coverImage ?? "/placeholder-card.png",
    cardsCount: deck.cardsCount,
    category: deck.format,
    lastUpdatedAt: deck.updatedAt,
  }));
}