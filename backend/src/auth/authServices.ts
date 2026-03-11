import type { RegisterDTO, LoginDTO, User } from "./authTypes.js"
import { hashPassword, comparePassword } from "../utils/hash.js"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js"
import { randomUUID } from "crypto"

const users: User[] = []

const refreshTokens: string[] = []

export class AuthService {

  async register(data: RegisterDTO) {

    const userExists = users.find(u => u.email === data.email)

    if (userExists) {
      throw new Error("User already exists")
    }

    const hashedPassword = await hashPassword(data.password)

    const user: User = {
      id: randomUUID(),
      email: data.email,
      password: hashedPassword
    }

    users.push(user)

    return {
      id: user.id,
      email: user.email
    }
  }

  async login(data: LoginDTO) {

    const user = users.find(u => u.email === data.email)

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const valid = await comparePassword(data.password, user.password)

    if (!valid) {
      throw new Error("Invalid credentials")
    }

    const accessToken = generateAccessToken({
      userId: user.id
    })

    const refreshToken = generateRefreshToken({
      userId: user.id
    })

    refreshTokens.push(refreshToken)

    return {
      accessToken,
      refreshToken
    }
  }

  async refresh(refreshToken: string) {

    if (!refreshTokens.includes(refreshToken)) {
      throw new Error("Invalid refresh token")
    }

    const payload = verifyRefreshToken(refreshToken)

    const accessToken = generateAccessToken({
      userId: payload.userId
    })

    return {
      accessToken
    }
  }

  async logout(refreshToken: string) {

    const index = refreshTokens.indexOf(refreshToken)

    if (index > -1) {
      refreshTokens.splice(index, 1)
    }

    return { message: "Logged out" }
  }
}