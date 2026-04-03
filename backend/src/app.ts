import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";

const app = express();

// ----------------------
// Configuração de CORS
// ----------------------

// Front-end hospedado na Vercel
const allowedOrigins = [
  "https://portifolio-pmzupe0n1-muvuckas-projects.vercel.app",
  "http://localhost:3000" // opcional, para testes locais
];

app.use(cors({
  origin: function(origin, callback) {
    // permite requests sem origin (como Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `O CORS para este site (${origin}) não está permitido!`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // se precisar enviar cookies
}));

// Middleware para processar JSON
app.use(express.json());

// ----------------------
// Rotas
// ----------------------
app.use("/explorer", explorerRoutes);
app.use("/", authRoutes);
app.use("/decks", deckRoutes);

export default app;