import { Router } from "express";
import type { Request, Response } from "express";

import {
  getDeckStats,
} from "../services/deck.js";
import { authMiddleware } from "../auth/authMiddleware.js";

const router = Router();


/* =========================
   GET DECK STATS
========================= */
router.get(
  "/:id/stats", authMiddleware,
  async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const stats = await getDeckStats(
        req.params.id,
        req.user.id
      );

      res.json(stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      }
    }
  }
);

export default router;