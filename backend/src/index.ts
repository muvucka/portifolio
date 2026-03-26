import app from "./app.js";
import { syncScryfallSets } from "./services/scryfallSync.js";
import cron from "node-cron";

const PORT = 3000;

app.listen(PORT, async () => {
  console.log(`Server rodando em http://localhost:${PORT}`);

  console.log("Rodando sync inicial...");
  
  await syncScryfallSets();

  console.log("Sync inicial concluído");
  
  // 🔥 roda em background (não bloqueia o server)
  // roda a cada 6 horas
cron.schedule("0 */6 * * *", () => {
  console.log("Rodando sync agendado...");
  syncScryfallSets();
});
});