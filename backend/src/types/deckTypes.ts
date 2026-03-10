export interface CreateDeckDTO {
  name: string;
  commanderName: string;
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
}