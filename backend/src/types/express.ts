import type { User } from "../../prisma/generated/client/index.js";


declare global {
  namespace Express {
    interface Request {
      user: User; // ou { id: string } se só usar id
    }
  }
}