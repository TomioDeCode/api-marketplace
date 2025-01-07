import { Elysia } from "elysia";
import { AuthUseCase } from "../../domain/usecases/auth.usecase";

export const authMiddleware = (authUseCase: AuthUseCase) =>
  new Elysia().derive(async ({ headers }) => {
    const token = headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("No token provided");
    }

    try {
      const user = await authUseCase.verifyToken(token);
      return { user };
    } catch (error) {
      throw new Error("Invalid token");
    }
  });
