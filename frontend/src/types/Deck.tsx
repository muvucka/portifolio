export interface Deck {
  id: string;
  name: string;
  coverImage: string;
  category: string;        // ex: Commander, Standard, Modern, Cube
  cardsCount: number;

  lastUpdatedAt: string;
}
