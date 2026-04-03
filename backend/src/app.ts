import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";

const app = express();

// Mantendo a rota já existente do explorerRoutes
app.get("/explorer/discover", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM discover LIMIT 10"); // Ajuste a tabela
    res.json({
      latestSets: rows, // Exemplo, mapeie conforme sua tabela real
      precons: rows
    });
  } catch (err: any) {
    console.error("Erro ao buscar discover:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/explorer", explorerRoutes);
// Middleware para processar JSON
app.use(express.json());

// Habilitando CORS para qualquer origem (pode restringir depois)
app.use(cors({
  origin: "*" // ou coloque seu front-end
}));

// --- Conexão MySQL mínima ---
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não definida`);
  return value;
}

const pool = mysql.createPool({
  host: getEnvVar("MYSQL_HOST"),
  user: getEnvVar("MYSQL_USER"),
  password: getEnvVar("MYSQL_PASSWORD"),
  database: getEnvVar("MYSQL_DB"),
  port: Number(process.env.MYSQL_PORT || 3306)
});

// Exemplo mínimo de endpoint /explorer/discover


// Rotas existentes
app.use("/", authRoutes);
app.use("/decks", deckRoutes);

// Porta para Railway / Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));

export default app;