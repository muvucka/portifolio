import prisma from "../services/prisma.js";
import type { ScryfallCard } from "../types/scryfallTypes.js";
import { fetchCardByName } from "./scryfall.js";

export async function getOrCreateCard(name: string) {
  // Busca o card no Scryfall
  const scryfallCard = (await fetchCardByName(name)) as ScryfallCard;

  // Verifica se o card é Basic Land
  const isBasicLand = scryfallCard.type_line.includes("Basic Land");

  // Cria ou conecta as cores e color identities
  const colorIdentitiesData = (scryfallCard.color_identity || []).map(value => ({
    value,
  }));

  const colorsData = (scryfallCard.colors || []).map(value => ({
    value,
  }));

  // Verifica se o set existe no banco de dados
  let set = await prisma.set.findUnique({
    where: { name: scryfallCard.set },  // Usando o setCode do Scryfall (set)
  });

  // Se o set não existir, cria um novo set
  if (!set) {
    set = await prisma.set.create({
      data: {
        name: scryfallCard.set, // Usando o setCode do Scryfall
        // Você pode adicionar outros campos do set, caso existam
      },
    });
  }

  // Verifica se o card já existe no banco de dados (com base no nome e setCode)
  let card = await prisma.card.findUnique({
    where: {
      name_setCode: {
        name,
        setCode: scryfallCard.set, // Set Code vindo diretamente do Scryfall
      },
    },
  });

  // Se o card não for encontrado, cria um novo card com os dados do Scryfall
  if (!card) {
    card = await prisma.card.create({
      data: {
        scryfallId: scryfallCard.id,
        name: scryfallCard.name,
        typeLine: scryfallCard.type_line,
        cmc: scryfallCard.cmc,
        imageNormal: scryfallCard.image_uris?.normal ?? null,  // Imagem normal do Scryfall
        imageArtCrop: scryfallCard.image_uris?.art_crop ?? null, // Imagem Art Crop do Scryfall
        setCode: set.name, // Usando o setCode do Set criado ou encontrado
        setName: scryfallCard.set_name, // Nome do Set vindo do Scryfall
        isBasicLand, // Identificação se é um Basic Land

        // Relacionamentos com cores
        colorIdentities: {
          create: colorIdentitiesData,
        },
        colors: {
          create: colorsData,
        },
        collectorNumber: scryfallCard.collectorNumber, // Número do coletor vindo do Scryfall
      },
      include: {
        colorIdentities: true,
        colors: true,
      },
    });
  }

  return card;
}