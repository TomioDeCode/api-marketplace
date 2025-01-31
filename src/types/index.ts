export interface JWTPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
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
  checkInterval?: number;
  timeout?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
