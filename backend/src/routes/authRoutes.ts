import { Router } from "express"
import { AuthController } from "../auth/authController.js"

const router = Router()
const controller = new AuthController()

// GET / → serve como "login" (pode retornar uma mensagem ou redirecionar)
router.get("/", (req, res) => {
  res.send("Bem-vindo! Faça login em POST /login")
  // ou, se quiser redirecionar para o endpoint de login:
  // res.redirect("/login")
})

// Endpoints de autenticação
router.post("/register", controller.register)
router.post("/login", controller.login)
router.post("/refresh", controller.refresh)
router.post("/logout", controller.logout)

export default router