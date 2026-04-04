import app from "./app.js";
import { syncScryfallSets } from "./services/scryfallSync.js";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startSync();
});

async function startSync() {
  try {
    console.log("Iniciando sync em background...");
    
    await new Promise(resolve => setImmediate(resolve));
    
    syncScryfallSets()
      .then(() => console.log("Sync inicial concluído"))
      .catch(err => console.error("Erro no sync inicial:", err));

  } catch (err) {
    console.error(err);
  }
}