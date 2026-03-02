export interface CreateDeckDTO {
  name: string;
  commanderName: string;
}

export interface AddCardDTO {
  cardName: string;
  quantity?: number;
}

export interface DeckStats {
  totalCards: number;
  averageCMC: string | number;
  typeCount: Record<string, number>;
}
