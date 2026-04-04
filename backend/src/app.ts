import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";

const app = express();

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Variável ${name} não definida`);
    return "";
  }
  return value;
}

const pool = mysql.createPool({
  host: getEnvVar("MYSQL_HOST"),
  user: getEnvVar("MYSQL_USER"),
  password: getEnvVar("MYSQL_PASSWORD"),
  database: getEnvVar("MYSQL_DB"),
  port: Number(process.env.MYSQL_PORT || 3306)
});

app.use(express.json());

app.use(cors({
  origin: "*"
}));

app.get("/", (req, res) => {
  res.send("API OK");
});

app.use("/explorer", explorerRoutes);
app.use("/auth", authRoutes);
app.use("/decks", deckRoutes);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});

export default app;