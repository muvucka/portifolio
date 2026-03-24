import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../auth/authMiddleware.js";
import { fetchScryfallSets } from "../services/scryfall.js"; // criaremos essa função

import {
  createDeck,
  getDeckById,
  getAllDecks,
  updateDeck,
  deleteDeck,
  importDeck,
} from "../services/deck.js";

import type {
  CreateDeckDTO,
  UpdateDeckDTO,
  ImportDeckDTO,
} from "../types/deckTypes.js";
import prisma from "../db.js";

const router = Router();

/* =========================
   CREATE DECK
========================= */

// Adicionando o middleware à rota de criação do deck
router.post("/", authMiddleware, async (req: Request<{}, {}, CreateDeckDTO>, res: Response) => {
  try {
    const userId = req.user!.id;
    const deck = await createDeck(userId, req.body);
    res.json(deck);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
});

/* =========================
   GET DECK
========================= */
router.get(
  "/:id",
  authMiddleware,
  async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;

      const deck = await getDeckById(id, req.user.id);

      res.json(deck);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

/* =========================
   GET ALL DECKS
========================= */
/* =========================
   GET ALL DECKS
========================= */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  // ✅ Debug: loga o usuário vindo do middleware
  console.log("REQ.USER:", (req as any).user);

  if (!(req as any).user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decks = await getAllDecks((req as any).user.id);
    res.json(decks);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
});

/* =========================
   UPDATE DECK
========================= */
router.patch(
  "/:id", authMiddleware,
  async (
    req: Request<{ id: string }, {}, UpdateDeckDTO>,
    res: Response
  ) => {
    try {
      const deck = await updateDeck(req.params.id, req.body);
      res.json(deck);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

/* =========================
   DELETE DECK
========================= */
router.delete(
  "/:id", authMiddleware,
  async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    try {
      await deleteDeck(req.params.id);
      res.json({ message: "Deck deleted" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      }
    }
  }
);

router.post(
  "/import", authMiddleware,
  async (
    req: Request<{}, {}, ImportDeckDTO>,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const deck = await importDeck(req.user.id, req.body);

      res.json(deck);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

router.get("/discover", authMiddleware, async (req, res) => {
  try {
    console.log("=== /discover called ===");

    // 1️⃣ Busca sets do banco
    let latestSets = await prisma.set.findMany({
      orderBy: { releaseAt: "desc" },
      take: 10,
    });

    let precons = await prisma.set.findMany({
      where: { type: "commander" },
      orderBy: { releaseAt: "desc" },
      take: 10,
    });

    console.log("🏦 Banco atual:", latestSets.length, "latestSets,", precons.length, "precons");

    // 2️⃣ Se não existir nada no banco, chama Scryfall
    if (latestSets.length === 0 || precons.length === 0) {
      console.log("📭 Banco vazio ou incompleto. Buscando Scryfall...");

      const { latestSets: fetchedSets, precons: fetchedPrecons } = await fetchScryfallSets();

      console.log("📥 Dados recebidos da Scryfall:");
      console.log("  latestSets:", fetchedSets.map((s) => s.code));
      console.log("  precons:", fetchedPrecons.map((s) => s.code));

      // 3️⃣ Salva cada set no banco
      for (const set of fetchedSets) {
        await prisma.set.upsert({
          where: { code: set.code }, // assume que `code` é único
          update: {
            name: set.name,
            type: set.type,
            iconSvg: set.iconSvg ?? null,
            releaseAt: set.releaseAt,
          },
          create: {
            name: set.name,
            code: set.code,
            type: set.type,
            iconSvg: set.iconSvg ?? null,
            releaseAt: set.releaseAt,
          },
        });
      }

      for (const precon of fetchedPrecons) {
        await prisma.set.upsert({
          where: { code: precon.code },
          update: {
            name: precon.name,
            type: precon.type,
            iconSvg: precon.iconSvg ?? null,
            releaseAt: precon.releaseAt,
          },
          create: {
            name: precon.name,
            code: precon.code,
            type: precon.type,
            iconSvg: precon.iconSvg ?? null,
            releaseAt: precon.releaseAt,
          },
        });
      }

      // 4️⃣ Buscar de novo no banco para garantir id, createdAt e updatedAt
      latestSets = await prisma.set.findMany({
        orderBy: { releaseAt: "desc" },
        take: 10,
      });

      precons = await prisma.set.findMany({
        where: { type: "commander" },
        orderBy: { releaseAt: "desc" },
        take: 10,
      });

      console.log("🏦 Banco atualizado após Scryfall:", latestSets.length, "latestSets,", precons.length, "precons");
    }

    // 5️⃣ Retorna os dados para o frontend
    res.json({ sets: latestSets, precons });
  } catch (err) {
    console.error("❌ Erro no /discover:", err);
    res.status(500).json({ error: "Erro ao buscar discover" });
  }
});

export default router;
