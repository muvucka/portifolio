// authRoutes.js
import { Router } from "express";
import { AuthController } from "../auth/authController.js";

const router = Router();
const controller = new AuthController();

router.get("/", (req, res) => {
  console.log('Raiz de auth acessada');
  res.send("Bem-vindo! Faça login em POST /login");
});

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

export default router;