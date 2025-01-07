import { Elysia } from "elysia";
import { SQLiteUserRepository } from "./infrastructure/repositories/user.repository";
import { AuthUseCase } from "./domain/usecases/auth.usecase";
import { AuthController } from "./presentation/controllers/auth.controller";
import { ENV } from "./config/env";

const app = new Elysia();

const userRepository = new SQLiteUserRepository();
const authUseCase = new AuthUseCase(userRepository);
const authController = new AuthController(authUseCase);

authController.setupRoutes(app);

app.listen(ENV.PORT, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${ENV.PORT}`);
});
