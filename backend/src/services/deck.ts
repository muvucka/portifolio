import { prisma } from "./prisma.js";
import type { Deck, DeckCard, Card } from "@prisma/client";
import { getOrCreateCard } from "./card.js";
import type { CreateDeckDTO, DeckStats, ImportDeckDTO } from "../types/deckTypes.js";

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
  userId: string,
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
      userId,
    },
  });
}

/* =========================
   GET ALL DECKS
========================= */
export async function getAllDecks(userId: string): Promise<Deck[]> {
  return prisma.deck.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function importDeck(
  userId: string,
  data: ImportDeckDTO
): Promise<Deck> {
  const commander = await getOrCreateCard(data.commanderName);

  if (!commander.typeLine.includes("Legendary")) {
    throw new Error("Comandante precisa ser lendário.");
  }

  const deck = await prisma.deck.create({
    data: {
      name: data.name,
      format: "commander",
      commanderId: commander.id,
      userId,
    },
  });

  const lines = data.decklist
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(\d+)x?\s+(.+)$/i);

    if (!match) continue;

    const quantity = Number(match[1]);
    const cardName = match[2]!;

    try {
      await addCardToDeck(deck.id, cardName, quantity);
    } catch (err) {
      console.warn(`Erro ao importar carta ${cardName}`);
    }
  }

  return deck;
}

/* =========================
   UPDATE DECK
========================= */
export async function updateDeck(
  deckId: string,
  data: { name?: string }
): Promise<Deck> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });

  if (!deck) {
    throw new Error("Deck não encontrado.");
  }

  return prisma.deck.update({
    where: { id: deckId },
    data,
  });
}

/* =========================
   DELETE DECK
========================= */
export async function deleteDeck(
  deckId: string
): Promise<void> {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });

  if (!deck) {
    throw new Error("Deck não encontrado.");
  }

  await prisma.deckCard.deleteMany({
    where: { deckId },
  });

  await prisma.deck.delete({
    where: { id: deckId },
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

  if (existing && !card.isBasicLand) {
    throw new Error(
      "Commander permite apenas 1 cópia dessa carta."
    );
  }

  const totalCards = await prisma.deckCard.aggregate({
    where: { deckId },
    _sum: { quantity: true },
  });

  const currentTotal = totalCards._sum.quantity ?? 0;

  if (currentTotal + quantity > MAX_COMMANDER_CARDS) {
    throw new Error("Deck já possui 99 cartas.");
  }

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
   UPDATE CARD QUANTITY
========================= */
export async function updateCardQuantity(
  deckId: string,
  cardId: string,
  quantity: number
): Promise<DeckCard> {
  if (quantity < 1) {
    throw new Error("Quantidade deve ser maior que 0.");
  }

  const entry = await prisma.deckCard.findUnique({
    where: {
      deckId_cardId: {
        deckId,
        cardId,
      },
    },
  });

  if (!entry) {
    throw new Error("Carta não encontrada no deck.");
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error("Carta inválida.");
  }

  if (!card.isBasicLand && quantity > 1) {
    throw new Error("Commander permite apenas 1 cópia.");
  }

  return prisma.deckCard.update({
    where: { id: entry.id },
    data: { quantity },
  });
}

/* =========================
   REMOVE CARD
========================= */
export async function removeCardFromDeck(
  deckId: string,
  cardId: string
): Promise<void> {
  const entry = await prisma.deckCard.findUnique({
    where: {
      deckId_cardId: {
        deckId,
        cardId,
      },
    },
  });

  if (!entry) {
    throw new Error("Carta não encontrada no deck.");
  }

  await prisma.deckCard.delete({
    where: { id: entry.id },
  });
}

/* =========================
   GET DECK
========================= */
export async function getDeckById(
  deckId: string,
  userId: string
): Promise<DeckWithCards | null> {
  return prisma.deck.findUnique({
    where: { id: deckId, userId},
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
  deckId: string,
  userId: string
): Promise<DeckStats> {
  const deck = await getDeckById(userId, deckId);

  if (!deck) throw new Error("Deck não encontrado.");

  let totalCMC = 0;
  let totalCards = 0;

  const typeCount: Record<string, number> = {};

  deck.deckCards.forEach(entry => {
    const card = entry.card;
    if (!card) return;

    const cmc = Number(card.cmc ?? 0);

    totalCMC += cmc * entry.quantity;
    totalCards += entry.quantity;

    const type =
      card.typeLine?.split("—")[0]?.trim() ?? "Unknown";

    typeCount[type] =
      (typeCount[type] ?? 0) + entry.quantity;
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