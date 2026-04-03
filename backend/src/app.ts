import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";

const app = express();

// CORS
const allowedOrigins = [
  "https://portifolio-pmzupe0n1-muvuckas-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// Rotas
app.use("/explorer", explorerRoutes);
app.use("/", authRoutes);
app.use("/decks", deckRoutes);

export default app;