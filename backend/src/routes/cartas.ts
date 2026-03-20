import { Router } from "express";
import type { Request, Response } from "express";

import {
  addCardToDeck,
  updateCardQuantity,
  removeCardFromDeck,
} from "../services/deck.js";

import type {
  AddCardDTO,
  UpdateCardDTO,
} from "../types/deckTypes.js";
import { authMiddleware } from "../auth/authMiddleware.js";

const router = Router();

/* =========================
   ADD CARD TO DECK
========================= */
router.post(
  "/:id/cards", authMiddleware,
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
   UPDATE CARD QUANTITY
========================= */
// PATCH /decks/:deckId/cards/:cardId
router.patch(
  "/:deckId/cards/:cardId",
  authMiddleware,
  async (req: Request<{ deckId: string; cardId: string }, {}, { quantity: number }>, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      const { deckId, cardId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1) return res.status(400).json({ error: "Quantidade mínima é 1" });

      const updated = await updateCardQuantity(deckId, cardId, quantity);

      res.json(updated);
    } catch (error: unknown) {
      if (error instanceof Error) res.status(400).json({ error: error.message });
    }
  }
);

/* =========================
   REMOVE CARD FROM DECK
========================= */
router.delete(
  "/:id/cards/:cardId", authMiddleware,
  async (
    req: Request<{ id: string; cardId: string }>,
    res: Response
  ) => {
    try {
      const { id, cardId } = req.params;

      const result = await removeCardFromDeck(id, cardId);

      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      }
    }
  }
);



export default router;