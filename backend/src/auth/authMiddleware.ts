import type { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt.js"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log("Authorization header recebido:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "Token missing" });
  }

  const token = authHeader.split(" ")[1] as string
  console.log("Token extraído:", token);

  try {
    const payload = verifyAccessToken(token);
    console.log("Payload decodificado:", payload);
    (req as any).user = { id: payload.userId };
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}