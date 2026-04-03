import express from "express";
import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";
import cors from "cors";

const app = express();

// Habilitando o CORS para o frontend
app.use(cors({
  origin: "*"
}));
app.use("/explorer", explorerRoutes);

// Middleware para processar requisições JSON
app.use(express.json());

// Rotas de autenticação e decks
app.use("/", authRoutes);
app.use("/decks", deckRoutes);

export default app;