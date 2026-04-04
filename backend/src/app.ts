import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deckRoutes from "./routes/baralho.js";
import explorerRoutes from "./routes/explorer.js";

const app = express();

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

export default app;