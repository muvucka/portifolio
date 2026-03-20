export interface User {
  id: string
  email: string
  password: string
}

export interface RegisterDTO {
  email: string
  password: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface JWTPayload {
  userId: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}