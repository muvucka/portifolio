import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

// Cria app Express
const app = express();
app.use(cors()); // habilita CORS
app.use(express.json());

// Configuração do MySQL via variáveis de ambiente
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "mydb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Testa conexão ao iniciar
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("MySQL conectado com sucesso!");
  } catch (err) {
    console.error("Erro ao conectar no MySQL:", err);
  }
}

// Rotas de exemplo
app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({ serverTime: rows });
  } catch (err) {
    res.status(500).json({ error: "Erro no banco de dados", details: err });
  }
});

// Inicializa servidor
const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Servidor rodando na porta ${port}`);
  await testConnection();
});

export default app;