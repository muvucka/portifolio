import app from "./app.js";
import { syncScryfallSets } from "./services/scryfallSync.js";
import cron from "node-cron";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  syncScryfallSets()
    .then(() => console.log('Sync inicial concluído'))
    .catch(err => console.error('Erro no sync inicial:', err));
});