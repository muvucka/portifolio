// authRoutes.js
import { Router } from "express";
import { AuthController } from "../auth/authController.js";

const router = Router();
const controller = new AuthController();

router.get("/", (req, res) => {
  console.log('Raiz de auth acessada');
  res.send("Bem-vindo! Faça login em POST /auth/login");
});

router.post("/auth/register", controller.register);
router.post("/auth/login", controller.login);
router.post("/auth/refresh", controller.refresh);
router.post("/auth/logout", controller.logout);

export default router;