import type { Request, Response } from "express"
import { AuthService } from "./authServices.js"

const authService = new AuthService()

export class AuthController {

  async register(req: Request, res: Response) {

    try {
      const user = await authService.register(req.body)

      res.status(201).json(user)

    } catch (err) {

      res.status(400).json({
        error: (err as Error).message
      })

    }
  }

  async login(req: Request, res: Response) {

    try {

      const token = await authService.login(req.body)

      res.json(token)

    } catch (err) {

      res.status(401).json({
        error: (err as Error).message
      })

    }
    }
    
    async refresh(req: Request, res: Response) {

  const { refreshToken } = req.body

  try {

    const token = await authService.refresh(refreshToken)

    res.json(token)

  } catch (err: any) {

    res.status(401).json({ error: err.message })

  }
    }
    
    async logout(req: Request, res: Response) {

  const { refreshToken } = req.body

  const result = await authService.logout(refreshToken)

  res.json(result)
    }
    

}