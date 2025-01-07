import { Elysia } from "elysia";
import { AuthUseCase } from "../../domain/usecases/auth.usecase";
import { User } from "../../domain/entities/user.entity";
import { authMiddleware } from "../middlewares/auth.middleware";

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  setupRoutes(app: Elysia) {
    app.post("/register", async ({ body }) => {
      try {
        const user = await this.authUseCase.register(body as User);
        return {
          message: "User registered successfully",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
      } catch (error) {
        return {
          status: 400,
          message: (error as Error).message,
        };
      }
    });

    app.post("/login", async ({ body }) => {
      try {
        const { email, password } = body as { email: string; password: string };
        const result = await this.authUseCase.login(email, password);
        return {
          message: "Login successful",
          ...result,
        };
      } catch (error) {
        return {
          status: 401,
          message: (error as Error).message,
        };
      }
    });

    app.group("/protected", (app) =>
      app
        .use(authMiddleware(this.authUseCase))
        .get("/profile", ({ cookie }) => {
          return {
            message: "Protected route accessed successfully",
            response: cookie,
          };
        })
    );

    return app;
  }
}
