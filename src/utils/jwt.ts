import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const jwt = {
  sign(
    payload: TokenPayload,
    secret: Secret,
    options: SignOptions = { expiresIn: "1d" }
  ): string {
    return sign(payload, secret, options);
  },

  verify(token: string, secret: Secret): JwtPayload & TokenPayload {
    return verify(token, secret) as JwtPayload & TokenPayload;
  },

  extractToken(authHeader: string): string | null {
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.split(" ")[1];
  },
};
