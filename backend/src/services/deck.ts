import { prisma } from "./prisma.js";
import type { Deck, DeckCard, Card } from "@prisma/client";
import { getOrCreateCard } from "./card.js";
import type { CreateDeckDTO, DeckStats } from "../types/deckTypes.js";

const MAX_COMMANDER_CARDS = 99;

/* =========================
   TYPES
========================= */

export type DeckWithCards = Deck & {
  commander?: Card | null;
  deckCards: (DeckCard & { card: Card })[];
};

/* =========================
   CREATE DECK
========================= */
export async function createDeck(
  data: CreateDeckDTO
): Promise<Deck> {
  const commander = await getOrCreateCard(data.commanderName);

  if (!commander.typeLine.includes("Legendary")) {
    throw new Error("Comandante precisa ser lendário.");
  }

  return prisma.deck.create({
    data: {
      name: data.name,
      format: "commander",
      commanderId: commander.id,
    },
  });
}

/* =========================
   ADD CARD
========================= */
export async function addCardToDeck(
  deckId: string,
  cardName: string,
  quantity: number = 1
): Promise<DeckCard> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: { commander: true },
  });

  if (!deck) throw new Error("Deck não encontrado.");

  const card = await getOrCreateCard(cardName);

  // Verifica cores do comandante
  const invalidColor = card.colorIdentity.find(
    (color: string) =>
      !deck.commander?.colorIdentity.includes(color)
  );
  if (invalidColor) {
    throw new Error(
      "Carta fora da identidade de cor do comandante."
    );
  }

  const existing = await prisma.deckCard.findUnique({
    where: {
      deckId_cardId: {
        deckId,
        cardId: card.id,
      },
    },
  });

  // Limita cópias de cartas não básicas
  if (existing && !card.isBasicLand) {
    throw new Error(
      "Commander permite apenas 1 cópia dessa carta."
    );
  }

  // Limite total de 99 cartas
  const totalCards = await prisma.deckCard.aggregate({
    where: { deckId },
    _sum: { quantity: true },
  });
  const currentTotal = totalCards._sum.quantity ?? 0;
  if (currentTotal + quantity > MAX_COMMANDER_CARDS) {
    throw new Error("Deck já possui 99 cartas.");
  }

  // Atualiza ou cria
  if (existing) {
    return prisma.deckCard.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  return prisma.deckCard.create({
    data: {
      deckId,
      cardId: card.id,
      quantity,
    },
  });
}

/* =========================
   GET DECK
========================= */
export async function getDeckById(
  deckId: string
): Promise<DeckWithCards | null> {
  return prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      commander: true,
      deckCards: {
        include: { card: true },
      },
    },
  });
}

/* =========================
   STATS
========================= */
export async function getDeckStats(
  deckId: string
): Promise<DeckStats> {
  const deck = await getDeckById(deckId);

  if (!deck) throw new Error("Deck não encontrado.");

  let totalCMC = 0;
  let totalCards = 0;
  const typeCount: Record<string, number> = {};

  deck.deckCards.forEach(entry => {
    const card = entry.card;
    if (!card) return; 

    // Calcula total CMC
    const cmc = Number(card.cmc ?? 0);
    totalCMC += cmc * entry.quantity;
    totalCards += entry.quantity;

    // Conta tipos
    const type = card.typeLine?.split("—")[0]?.trim()?? "Unknown";
    typeCount[type] = (typeCount[type] ?? 0) + entry.quantity;
  });

  return {
    totalCards,
    averageCMC:
      totalCards > 0
        ? Number((totalCMC / totalCards).toFixed(2))
        : 0,
    typeCount,
  };
}