import { Router } from "express";
import type { Request, Response } from "express";
import { authMiddleware } from "../auth/authMiddleware.js";// criaremos essa função
import { importDeckFromText } from "../services/deck.js";

import {
  createDeck,
  getDeckById,
  getAllDecks,
  updateDeck,
  deleteDeck,
} from "../services/deck.js";

import type {
  CreateDeckDTO,
  UpdateDeckDTO,
} from "../types/deckTypes.js";

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

router.post("/import-text", authMiddleware,async (req, res) => {
  try {
    // Pegando todos os dados que o seu frontend (JSON) enviou
    const { name, rawDecklist, cards, section } = req.body;
    
    // Pegando o ID do usuário do token (depende de como vc fez a autenticação)
    const userId = req.user.id; 

    const deck = await importDeckFromText(userId, name, rawDecklist, cards, section);
    
    return res.status(201).json(deck);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
})

export default router;
