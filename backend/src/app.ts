import express from "express"
import authRoutes from "./routes/authRoutes.js"
import deckRoutes from "./routes/baralho.js"

const app = express()

app.use(express.json())

app.use("/", authRoutes)
app.use("/decks", deckRoutes)

export default app