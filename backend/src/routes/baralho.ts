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

router.get("/discover", async (req, res) => {
  try {
    const latestSets = await prisma.set.findMany({
      orderBy: { releaseAt: "desc" },
      take: 10,
    });

    const precons = await prisma.set.findMany({
      where: { type: "commander" },
      orderBy: { releaseAt: "desc" },
      take: 10,
    });

    res.json({
      latestSets,
      precons,
    });
  } catch (err) {
    console.error("❌ Erro no /discover:", err);
    res.status(500).json({ error: "Erro ao buscar discover" });
  }
});

export default router;
