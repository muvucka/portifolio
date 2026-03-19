import prisma from "../services/prisma.js";
import type { Deck, DeckCard, Card } from "../../prisma/generated/client/index.js";
import { getOrCreateCard } from "./card.js";  // Função importada
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
// Função de criação de deck
export async function createDeck(userId: string, data: CreateDeckDTO): Promise<Deck> {
  // Busca ou cria o comandante
  const commander = await getOrCreateCard(data.commanderName)
  // Verifica se o comandante é lendário
  if (!commander.typeLine.includes("Legendary")) {
    throw new Error("Comandante precisa ser lendário.");
  }

  // Criação do deck
  const deck = await prisma.deck.create({
    data: {
      name: data.name,
      description: data.description,
      format: "commander",
      commanderId: commander.id,
      userId,
    },
  });

  // Para cada card no array de cards, cria ou busca o card e associa ao deck
  for (const cardData of data.cards) {
    // Passando todos os 4 parâmetros para a função getOrCreateCard
    const card = await getOrCreateCard(cardData.name)
    // Cria a associação entre o deck e o card
    await prisma.deckCard.create({
      data: {
        deckId: deck.id,
        cardId: card.id,
        quantity: cardData.quantity,
      },
    });
  }

  return deck;
}

/* =========================
   GET ALL DECKS
========================= */
export async function getAllDecks(userId: string) {
  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      commander: true,
      deckCards: true,
    },
  });

  return decks.map(deck => ({
    id: deck.id,
    name: deck.name,
    format: deck.format,
    updatedAt: deck.updatedAt,

    // ✅ capa estilo Spotify
    coverImage: deck.commander?.imageArtCrop ?? null,

    // ✅ total de cartas
    cardsCount: deck.deckCards.reduce((sum, c) => sum + c.quantity, 0),
  }));
}

export async function importDeck(
  userId: string,
  data: ImportDeckDTO
): Promise<Deck> {
  const commander = await getOrCreateCard(data.commanderName)
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
   ADD CARD TO DECK
========================= */
export async function addCardToDeck(
  deckId: string,
  cardName: string,
  quantity: number = 1
): Promise<DeckCard> {
  // Busca o deck com o comandante, incluindo suas cores
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      commander: {
        include: { colorIdentities: true } // inclui cores do comandante
      },
    },
  });

  if (!deck) throw new Error("Deck não encontrado.");
  if (!deck.commander) throw new Error("Deck não tem comandante definido.");

  // Busca ou cria a carta, incluindo suas cores e colorIdentities
  const card = await getOrCreateCard(cardName);

  // Incluindo colorIdentities e colors na consulta do Prisma para o card
  const cardWithColors = await prisma.card.findUnique({
    where: { id: card.id },
    include: {
      colorIdentities: true, // Inclui colorIdentities ao buscar o card
      colors: true,           // Inclui colors ao buscar o card
    },
  });

  if (!cardWithColors) {
    throw new Error("Card não encontrado ou não pode ser criado.");
  }

  // Extrai arrays de cores (strings) de card e comandante
  const cardColors = cardWithColors.colorIdentities.map(c => c.value);
  const commanderColors = deck.commander.colorIdentities.map(c => c.value);

  // Verifica se alguma cor da carta não está na identidade do comandante
  const invalidColor = cardColors.find(color => !commanderColors.includes(color));

  if (invalidColor) {
    throw new Error("Carta fora da identidade de cor do comandante.");
  }

  // Verifica se já existe a carta no deck
  const existing = await prisma.deckCard.findUnique({
    where: {
      deckId_cardId: {
        deckId,
        cardId: card.id,
      },
    },
  });

  if (existing && !card.isBasicLand) {
    throw new Error("Commander permite apenas 1 cópia dessa carta.");
  }

  // Verifica se o deck não ultrapassa 99 cartas
  const totalCards = await prisma.deckCard.aggregate({
    where: { deckId },
    _sum: { quantity: true },
  });

  const currentTotal = totalCards._sum.quantity ?? 0;

  if (currentTotal + quantity > MAX_COMMANDER_CARDS) {
    throw new Error("Deck já possui 99 cartas.");
  }

  // Atualiza quantidade se já existir
  if (existing) {
    return prisma.deckCard.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  }

  // Cria nova entrada
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
    where: { id: deckId, userId },
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