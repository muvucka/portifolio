# Portfólio de Aplicação Fullstack

## Descrição do Projeto

Este projeto de gerenciamento de decks precons de magic é um portfólio funcional que demonstra habilidades que foram adquiridas em desenvolvimento web pra simular projetos confidenciais trabalhados em estagio:

- **Frontend**: Desenvolvido com Vite, consumindo APIs externas e internas.
- **Backend**: Node.js com Express, arquitetura MVC (Controllers, Routes, Middlewares).
- **Banco de Dados**: MySQL, utilizando Prisma com migrations code-first.
- **Autenticação**: JWT para login, refresh tokens e proteção de rotas.
- **Deploy**: Aplicação hospedada na nuvem (Railway e Vercel), pronta para produção.
- **Consumo de API externa**: Integração com a API Scryfall para busca de cartas.
- **Tratamento de dados**: Normalização e enriquecimento dos dados retornados.

O objetivo é mostrar domínio completo de stack, incluindo: modelagem de dados, migrations, arquitetura de projeto, consumo e tratamento de APIs, deploy e configuração de variáveis de ambiente.

---

## Arquitetura do Projeto

/backend
├─ prisma/ # Schema, migrations e client Prisma
├─ routes/ # Rotas agrupadas por funcionalidade
├─ auth/ # Controllers de autenticação
├─ app.js # Configuração do Express e middlewares
└─ index.js # Entry point do servidor

/frontend
├─ src/ # Código do frontend em Vite
└─ assets/ # Imagens e vídeos do projeto

- **Backend**: MVC + middlewares + JWT
- **Banco**: MySQL com Prisma (code-first, migrations)
- **Frontend**: SPA consumindo o backend
- **Deploy**: App rodando na nuvem com todas variáveis configuradas

---

## Funcionalidades

- Registro, login, refresh e logout de usuários
- Criação, listagem e gerenciamento de decks
- Busca de dados externos via API (Scryfall)
- Proteção de rotas com JWT
- Exposição de endpoints REST consumidos pelo frontend
- Hospedagem completa na nuvem

---

## Imagens e Vídeos

Imagem
![pagina inicial](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/raiz.png)
![pagina login](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/login.png)
![pagina cadastro](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/register.png)
![pagina principal](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/raiz.png)
![card-hover](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/home-hover.png)
![popup de add](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/add.png)
![modal de add](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/boxadd.png)
![deck list](https://github.com/muvucka/portifolio/blob/main/frontend/src/assets/decks.png)
Vídeo
![fluxo inicial](assets/screen-video.mp4)
![fluxo deckList](assets/screen-video_WC5fSxlp.mp4)

---

## Instalação Local

1. Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>
Backend:
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run build
npm run start
Frontend:
cd frontend
npm install
npm run dev
Acesse:
Backend: http://localhost:8080
Frontend: http://localhost:3000 (ou porta do Vite)
Deploy em Produção
Configurar banco de dados na nuvem (ex: Railway):
Criar database MySQL
Configurar variáveis de ambiente:
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
Rodar migrations: prisma migrate deploy
Backend:
Hospedar no Railway
Configurar build e start scripts
Frontend:
Hospedar no Vercel ou similar
Configurar endpoint da API no .env
Consumo de API Externa

O backend integra a API Scryfall
 para buscar cartas, enriquecendo os dados antes de enviar ao frontend.

Controller trata a requisição
Filtra cartas lendárias
Retorna imagem ou placeholder caso não exista
JWT e Middleware
Middleware de autenticação verifica token
Rotas privadas são protegidas
Refresh token permite manter sessão ativa
Estrutura de Banco (Prisma + Migrations)
Code-first
Modelos principais:
User
Deck
Card
DeckCard
RefreshToken
Índices e constraints configurados no schema
prisma generate para gerar client


Scripts Disponíveis
"scripts": {
  "build": "prisma generate && tsc",
  "start": "prisma migrate deploy && node dist/index.js",
  "dev": "tsx watch src/index.ts",
  "sync": "node dist/scripts/sync.js" }
