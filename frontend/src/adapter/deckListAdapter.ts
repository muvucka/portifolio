import type { Deck } from "../types/Deck";

export interface ApiDeckListItem {
  id: string;
  name: string;
  format: string;
  updatedAt: string;
  coverImage?: string | null;
  cardsCount: number;
}

// types/Set.ts
export interface ApiSetItem {
  id: string;
  name: string;
  code: string;
  type: string;
  iconSvg?: string | null;
  releaseAt?: string | null;
}
export interface DiscoverResponse {
  sets: ApiSetItem[];
  precons: ApiSetItem[];
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

export function mapSetToUI(set: ApiSetItem) {
  return {
    id: set.id,
    name: set.name,
    image: set.iconSvg,
  };
}
