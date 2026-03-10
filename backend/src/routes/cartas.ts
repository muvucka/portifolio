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

const router = Router();

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
   UPDATE CARD QUANTITY
========================= */
router.patch(
  "/:id/cards/:cardId",
  async (
    req: Request<{ id: string; cardId: string }, {}, UpdateCardDTO>,
    res: Response
  ) => {
    try {
      const { id, cardId } = req.params;
      const { quantity } = req.body;

      const result = await updateCardQuantity(
        id,
        cardId,
        quantity
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
   REMOVE CARD FROM DECK
========================= */
router.delete(
  "/:id/cards/:cardId",
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