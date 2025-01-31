import { JwtPayload } from "jsonwebtoken";

export interface JWTPayload extends JwtPayload {
  userId: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface EndpointRequest {
  name: string;
  url: string;
  headers: object;
  checkInterval?: number;
  timeout?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
