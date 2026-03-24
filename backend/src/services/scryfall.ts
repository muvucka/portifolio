// services/cardService.ts
import fetch from "node-fetch";
import type { ScryfallCardResponse } from "../types/deckTypes.js";

export async function fetchCardByName(name: string) {
  const response = await fetch(
    `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
    {
      headers: {
        "User-Agent": "NAGO/1.0",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error("Carta não encontrada");
    throw new Error(`Scryfall error: ${response.status} ${response.statusText}`);
  }

  // ✅ aqui a mágica: diz pro TypeScript que o retorno é do tipo da interface
  const data = (await response.json()) as ScryfallCardResponse;

  return {
    scryfallId: data.id,
    name: data.name,
    typeLine: data.type_line,
    cmc: data.cmc,
    imageNormal: data.image_uris?.normal ?? null,
    imageArtCrop: data.image_uris?.art_crop ?? null,
    setCode: data.set,
    setName: data.set_name,
    collectorNumber: data.collector_number,
    isBasicLand: data.type_line.toLowerCase().includes("basic"),
    colors: data.colors ?? [],
    colorIdentity: data.color_identity ?? [],
  };
}