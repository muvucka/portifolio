import prisma from "../services/prisma.js";
import { fetchCardByName } from "../services/scryfall.js";

async function fixCardColors() {
  console.log("Buscando cards sem cores...");

  const cards = await prisma.card.findMany({
    include: {
      colors: true,
      colorIdentities: true,
    },
  });

  const cardsToFix = cards.filter(
    (card) => card.colors.length === 0 || card.colorIdentities.length === 0
  );

  console.log(`${cardsToFix.length} cards precisam de correção`);

  for (const card of cardsToFix) {
    try {
      console.log(`Atualizando: ${card.name}`);

      const scryfallCard = await fetchCardByName(card.name);

      const colorsData = (scryfallCard.colors || []).map((c) => ({
        value: c,
      }));

      const colorIdentitiesData = (scryfallCard.colorIdentity || []).map((c) => ({
        value: c,
      }));

      await prisma.card.update({
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
      });

      console.log(`Corrigido: ${card.name}`);
    } catch (err) {
      console.error(`Erro em ${card.name}:`, err);
    }
  }

  console.log("Finalizado!");
}

fixCardColors()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });