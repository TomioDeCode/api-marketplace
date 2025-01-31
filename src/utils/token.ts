import { sign, verify, Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "../types/index";

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: Number(config.jwtExpiry),
  };

  return sign(payload, config.jwtSecret as Secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return verify(token, config.jwtSecret as Secret) as JWTPayload;
};
