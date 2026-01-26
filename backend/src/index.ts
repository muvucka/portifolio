const app = require('./server');

const port = process.argv[2] || 7070;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
