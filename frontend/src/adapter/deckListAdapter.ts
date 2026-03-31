import type { Deck } from "../types/Deck";

export interface ApiDeckListItem {
  id: string;
  name: string;
  format: string;
  updatedAt: string;
  coverImage?: string | null;
  cardsCount: number;
  section: "meus" | "proximos";
}

// types/Set.ts
export interface ApiSetItem {
  id: string;
  code: string;
  name: string;
  releaseAt: string;
  type: string;
  iconSvg: string | null; // Alterado para 'icon_svg_uri'
  commanderImage?: string | null; // Nova propriedade para a imagem do comandante
}

export interface DiscoverResponse {
  latestSets: ApiSetItem[];
  precons: ApiSetItem[];
}

export function mapDeckListToUI(data: ApiDeckListItem[]): Deck[] {
  return data.map(deck => ({
    id: deck.id,
    name: deck.name,
    coverImage: deck.coverImage ?? "/placeholder-card.png",
    cardsCount: deck.cardsCount,
    format: deck.format,
    updatedAt: deck.updatedAt,
    section: deck.section,
  }));
}

export function mapSetToUI(set: ApiSetItem) {
  return {
    id: set.id,
    name: set.name,
    image: set.iconSvg ?? "/placeholder-set.png",
  };
}
