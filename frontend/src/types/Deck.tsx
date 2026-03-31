export interface Deck {
  id: string;
  name: string;
  coverImage?: string;
  format: string;        // ex: Commander, Standard, Modern, Cube
  cardsCount: number;
  section: "meus" | "proximos";   // A seção a qual o deck pertence

  updatedAt: string;
}
