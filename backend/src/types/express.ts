import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User; // ou { id: string } se só usar id
    }
  }
}