import app from "./app.js";
import { syncScryfallSets } from "./services/scryfallSync.js";
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  // Executa a sincronização depois que o servidor já começou
  setTimeout(() => {
    syncScryfallSets()
      .then(() => console.log('Sync inicial concluído'))
      .catch(err => console.error('Erro no sync inicial:', err));
  }, 0);
});