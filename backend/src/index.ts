import app from "./app.js";
import 'dotenv/config';

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log("PORTA DO PROCESSO:", process.env.PORT);
});