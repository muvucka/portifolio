export interface ScryfallCard {
  id: string; // ID único do card no Scryfall
  name: string; // Nome do card
  type_line: string; // Tipo do card (ex: "Artifact", "Creature", etc.)
  cmc: number; // Custo de Mana Convertido
  image_uris?: {
    normal?: string; // URL para a imagem normal
    art_crop?: string; // URL para a imagem cropada (art)
  };
  colors: string[]; // Lista de cores do card (ex: ["Green", "Red"])
  color_identity: string[]; // Identidade de cores do card (ex: ["Green"])
  set: string; // Código do set (ex: "alpha", "beta", etc.)
  set_name: string; // Nome do set (ex: "Alpha", "Beta", etc.)
  collectorNumber: string; // Número do coletor dentro do set
  rarity: string; // Raridade do card (ex: "Rare", "Mythic", "Uncommon", etc.)
  price_usd?: string; // Preço do card em USD (se disponível)
  scryfall_uri?: string; // URL da página do card no Scryfall
}