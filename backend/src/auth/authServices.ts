import { PrismaClient } from "../../prisma/generated/client/index.js";// Importando o Prisma Client
import type { RegisterDTO, LoginDTO, User } from "./authTypes.js"; // Tipos personalizados
import { hashPassword, comparePassword } from "../utils/hash.js"; // Funções de hash
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js"; // Funções de JWT

const prisma = new PrismaClient(); // Instanciando o Prisma Client

export class AuthService {

  // Registro de usuário
  async register(data: RegisterDTO) {
    // Verificar se o email já está registrado no banco
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new Error("User already exists");
    }

    // Criptografar a senha antes de salvar
    const hashedPassword = await hashPassword(data.password);

    // Criar o novo usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  // Login do usuário
  async login(data: LoginDTO) {
    // Verificar se o usuário existe no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Comparar as senhas
    const valid = await comparePassword(data.password, user.password);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    // Gerar o access token e refresh token
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Opcional: Armazenar o refresh token no banco de dados (se necessário)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Refresh do token
  async refresh(refreshToken: string) {
    // Verificar se o refresh token existe no banco de dados
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord) {
      throw new Error("Invalid refresh token");
    }

    // Verificar e decodificar o payload do refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Gerar um novo access token
    const accessToken = generateAccessToken({ userId: payload.userId });

    return {
      accessToken,
    };
  }

  // Logout (remover o refresh token)
  async logout(refreshToken: string) {
    // Remover o refresh token do banco de dados
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return { message: "Logged out" };
  }
}