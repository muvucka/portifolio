// Atualizando o DTO para refletir as necessidades do modelo Card
export interface CreateDeckDTO {
  name: string;
  description: string;
  commanderName: string;
  section:  "meus" | "proximos";   // A seção a qual o deck pertence
  cards: {
    name: string;  // Nome do card
    quantity: number;
    setCode: string;  // Código do set do card
    collector_number: string;  // Número do coletor (opcional)
    image: string;  // Imagem do card
  }[]; // Lista de cards
}

export interface AddCardDTO {
  cardName: string;
  quantity?: number;
}

export interface UpdateDeckDTO {
  name?: string;
}

export interface UpdateCardDTO {
  quantity: number;
}

export interface DeckStats {
  totalCards: number;
  averageCMC: string | number;
  typeCount: Record<string, number>;
}
export interface ImportDeckDTO {
  name: string;
  commanderName: string;
  decklist: string;
  section: "meus" | "proximos";
}

// types/CardTypes.ts
export interface ScryfallCardResponse {
  id: string;
  name: string;
  type_line: string;
  cmc: number;
  image_uris?: {
    normal?: string;
    art_crop?: string;
  };
  set: string;
  set_name: string;
  collector_number: string;
  colors?: string[];
  color_identity?: string[];
}

export interface ScryfallSearchResponse {
  data: ScryfallCardResponse[];
}

export interface ImportPreconDTO {
  name: string;
  sourceUrl: string;
}