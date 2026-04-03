import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";

const app = express();



app.use(cors({
  origin: "*",
  credentials: false
}));

app.use(express.json());

// Rotas
app.use("/explorer", explorerRoutes);
app.use("/", authRoutes);
app.use("/decks", deckRoutes);

export default app;