import app from "./app.js";
import { syncScryfallSets } from "./services/scryfallSync.js";
import cron from "node-cron";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server rodando na porta ${PORT}`);

  // roda sync inicial, mas sem bloquear o servidor
  syncScryfallSets().catch(err => console.error("Erro no sync inicial:", err));

  // roda cron a cada 6 horas
  cron.schedule("0 */6 * * *", () => {
    console.log("Rodando sync agendado...");
    syncScryfallSets().catch(err => console.error(err));
  });
});