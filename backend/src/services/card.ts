import { prisma } from "./prisma.js";
import type { ScryfallCard } from "../types/scryfallTypes.js";
import { fetchCardByName } from "./scryfall.js";

export async function getOrCreateCard(name: string) {
  const scryfallCard = (await fetchCardByName(name)) as ScryfallCard;

  const isBasicLand = scryfallCard.type_line.includes("Basic Land");

  return prisma.card.create({
    data: {
      scryfallId: scryfallCard.id,
      name: scryfallCard.name,
      typeLine: scryfallCard.type_line,
      cmc: scryfallCard.cmc,
      imageNormal: scryfallCard.image_uris?.normal ?? null,
      imageArtCrop: scryfallCard.image_uris?.art_crop ?? null,
      colors: scryfallCard.colors || [],
      colorIdentity: scryfallCard.color_identity || [],
      setCode: scryfallCard.set,
      setName: scryfallCard.set_name,
      isBasicLand,
    },
  });
}