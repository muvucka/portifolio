import prisma from "../services/prisma.js";
import type { Deck, DeckCard, Card } from "../../prisma/generated/client/index.js";
import { getOrCreateCard } from "./card.js";  // Função importada
import type { CreateDeckDTO, DeckStats, ImportDeckDTO } from "../types/deckTypes.js";
import { fetchCard } from "../services/scryfall.js";

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
      format: "commander",
      commanderId: commander.id,
      userId,
      section: "meus", // Define a seção como "meus" por padrão
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
        section: deck.section, // Adiciona a seção aqui
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
    section: deck.section,
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

type ParsedCard = {
  name: string;
  quantity: number;
  section: "meus" | "proximos";
};

type ScryfallCard = {
  id: string;
  name: string;
  type_line: string;
  cmc: number;
  image_uris?: {
    normal?: string;
    art_crop?: string;
  };
  card_faces?: {
    image_uris?: {
      normal?: string;
      art_crop?: string;
    };
  }[];
  set: string;
  set_name: string;
};

// CACHE EM MEMÓRIA (por execução)
const cardCache = new Map<string, ScryfallCard>();

async function getCard(name: string): Promise<ScryfallCard> {
  if (cardCache.has(name)) {
    return cardCache.get(name)!;
  }

  const data = await fetchCard(name);

  if (!data) {
    throw new Error(`Carta não encontrada: ${name}`);
  }

  cardCache.set(name, data);
  return data;
}

export async function importDeckFromText(
  userId: string,
  name: string,
  rawDecklist?: string,
  cards?: { quantity: number; name: string }[]
) {
  if (!rawDecklist && !cards) {
    throw new Error("Nenhuma decklist fornecida");
  }

  // Converte array de cards em string
  const decklistString =
    rawDecklist ||
    cards!.map(c => `${c.quantity} ${c.name}`).join("\n");

  // Parse das cartas
  const parsed: ParsedCard[] = decklistString
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const cleaned = line.replace(/\(.*?\)\s*\d*$/, "").trim();
      const match = cleaned.match(/^(\d+)\s+(.+)$/);
      if (!match) return null;
      return {
        quantity: parseInt(match[1]!),
        name: match[2], // Adiciona a seção aqui
      };
    })
    .filter((x): x is ParsedCard => !!x && !!x.name);

  if (parsed.length === 0) {
    throw new Error("Decklist vazia");
  }

  const uniqueNames = [...new Set(parsed.map(c => c.name))];

  // Busca cartas com fuzzy search
  const cardsData = await Promise.all(
    uniqueNames.map(async name => {
      try {
        return await getCard(name);
      } catch {
        return null;
      }
    })
  );

  const notFound = uniqueNames.filter((_, i) => !cardsData[i]);
  if (notFound.length > 0) {
    throw new Error(`Cartas não encontradas na API: ${notFound.join(", ")}`);
  }

  // --- UPSERT DOS SETS ---
  const uniqueSetCodes = [...new Set(cardsData.map(c => c!.set))];
  const setMap = new Map<string, { id: string; code: string }>();

  await Promise.all(
    uniqueSetCodes.map(async setCode => {
      const exampleCard = cardsData.find(c => c!.set === setCode)!;
      const dbSet = await prisma.set.upsert({
        where: { code: setCode },
        update: {},
        create: {
          code: setCode,
          name: exampleCard!.set_name,
          type: "unknown",
        },
      });
      setMap.set(setCode, { id: dbSet.id, code: dbSet.code });
    })
  );

  // --- UPSERT DOS CARDS ---
  const dbCards = await Promise.all(
    cardsData.map(data =>
      prisma.card.upsert({
        where: { scryfallId: data!.id },
        update: {},
        create: {
          scryfallId: data!.id,
          name: data!.name,
          typeLine: data!.type_line,
          cmc: data!.cmc,
          imageNormal:
            data!.image_uris?.normal ||
            data!.card_faces?.[0]?.image_uris?.normal ||
            null,
          imageArtCrop:
            data!.image_uris?.art_crop ||
            data!.card_faces?.[0]?.image_uris?.art_crop ||
            null,
          setCode: setMap.get(data!.set)!.code,
          setName: data!.set_name,
        },
      })
    )
  );

  const cardMap = new Map(dbCards.map(c => [c.name, c]));

  // Commander = primeira carta
  const commanderName = parsed[0]?.name;
  const commander = commanderName ? cardMap.get(commanderName) : undefined;
  if (!commander) {
    throw new Error(`Commander não encontrado: ${commanderName}`);
  }

  // --- CONSOLIDAR QUANTIDADES ---
  const deckCardsMap = new Map<string, number>();
  parsed.forEach(item => {
    const card = cardMap.get(item.name);
    if (!card) throw new Error(`Carta não encontrada no banco: ${item.name}`);
    const prevQty = deckCardsMap.get(card.id) || 0;
    deckCardsMap.set(card.id, prevQty + item.quantity);
  });

  const deckCards = Array.from(deckCardsMap.entries()).map(([cardId, quantity]) => ({
    cardId,
    quantity,
  }));

  // Cria deck com nome fornecido
  return prisma.deck.create({
    data: {
      name,
      format: "commander",
      userId,
      commanderId: commander.id,
      deckCards: { create: deckCards },
    },
  });
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