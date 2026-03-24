// src/db.ts
import { PrismaClient } from "../prisma/generated/client/index.js";

const prisma = new PrismaClient({
  // MySQL já funciona por padrão, não precisa de adapter
  log: ["query", "error"], // opcional, só pra debug
});

export default prisma;