export interface Deck {
  id: string;
  name: string;
  coverImage?: string;
  format: string;        // ex: Commander, Standard, Modern, Cube
  cardsCount: number;
  section: "meus" | "proximos"; // nova propriedade para diferenciar se é "meus" ou "próximos"

  updatedAt: string;
}
