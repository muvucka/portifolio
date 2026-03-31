import prisma from "../services/prisma.js";
import { fetchCardByName } from "./scryfall.js";

export async function getOrCreateCard(name: string) {
  const scryfallCard = await fetchCardByName(name);

  const isBasicLand = scryfallCard.typeLine.includes("Basic Land");

  const colorIdentitiesData = (scryfallCard.colorIdentity || []).map(value => ({
    value,
  }));

  const colorsData = (scryfallCard.colors || []).map(value => ({
    value,
  }));

  let set = await prisma.set.findUnique({
    where: { code: scryfallCard.setCode }, // 
  });

  if (!set) {
    set = await prisma.set.create({
      data: {
        code: scryfallCard.setCode, // 
        name: scryfallCard.setName,
        type: "unknown", // 
      },
    });
  }

  let card = await prisma.card.findUnique({
    where: {
      name_setCode: {
        name,
        setCode: scryfallCard.setCode,
      },
    },
  });

  if (card) {
  card = await prisma.card.update({
    where: { id: card.id },
    data: {
      colors: {
        deleteMany: {},
        create: colorsData,
      },
      colorIdentities: {
        deleteMany: {},
        create: colorIdentitiesData,
      },
    },
    include: {
      colors: true,
      colorIdentities: true,
    },
  });
}

  if (!card) {
    card = await prisma.card.create({
      data: {
        scryfallId: scryfallCard.scryfallId,
        name: scryfallCard.name,
        typeLine: scryfallCard.typeLine,
        cmc: scryfallCard.cmc,
        imageNormal: scryfallCard.imageNormal,
        imageArtCrop: scryfallCard.imageArtCrop,
        setCode: scryfallCard.setCode,
        setName: scryfallCard.setName,
        isBasicLand,
        collectorNumber: scryfallCard.collectorNumber,

        colorIdentities: {
          create: colorIdentitiesData,
        },
        colors: {
          create: colorsData,
        },
      },
      include: {
        colorIdentities: true,
        colors: true,
      },
    });
  }

  return card;
}