import { Router } from "express";
import type { Request, Response } from "express";

import {
  createDeck,
  addCardToDeck,
  getDeckById,
  getDeckStats,
} from "../services/deck.js";

import type {
  CreateDeckDTO,
  AddCardDTO,
} from "../types/deckTypes.js";

const router = Router();

/* =========================
   CREATE DECK
========================= */
router.post(
  "/",
  async (
    req: Request<{}, {}, CreateDeckDTO>,
    res: Response
  ) => {
    try {
      const deck = await createDeck(req.body);
      res.json(deck);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

/* =========================
   ADD CARD TO DECK
========================= */
router.post(
  "/:id/cards",
  async (
    req: Request<{ id: string }, {}, AddCardDTO>,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const { cardName, quantity } = req.body;

      const result = await addCardToDeck(
        id,
        cardName,
        quantity ?? 1
      );

      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

/* =========================
   GET DECK
========================= */
router.get(
  "/:id",
  async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const deck = await getDeckById(id);
      res.json(deck);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

/* =========================
   GET STATS
========================= */
router.get(
  "/:id/stats",
  async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const stats = await getDeckStats(id);
      res.json(stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

export default router;
