import type { Request, Response, NextFunction } from "express"
import { verifyRefreshToken } from "../utils/jwt.js"

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ error: "Token missing" })
  }

  const token = authHeader.split(" ")[1] as string

  try {

    const payload = verifyRefreshToken(token)

    ;(req as any).userId = payload.userId

    next()

  } catch {

    return res.status(401).json({ error: "Invalid token" })

  }
}