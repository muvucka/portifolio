import { syncScryfallSets } from "../services/scryfallSync.js";
import 'dotenv/config';

syncScryfallSets()
  .then(() => {
    console.log("Sync finalizado");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });