import express from "express"
import authRoutes from "./routes/authRoutes.js"
import deckRoutes from "./routes/baralho.js"
import cors from "cors";

const app = express()
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json())

app.use("/", authRoutes)
app.use("/decks", deckRoutes)

export default app