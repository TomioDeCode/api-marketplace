import { Hono } from "hono";
import { userController } from "../controllers";
import { authMiddleware } from "../middleware";

const userRouter = new Hono();

userRouter.use("*", authMiddleware.isAuth, authMiddleware.isAdmin);

userRouter.get("", async (c) => {
  return await userController.index(c);
});

userRouter.get("/list", async (c) => {
  return await userController.list(c);
});

userRouter.get(":id", async (c) => {
  return await userController.show(c);
});

userRouter.post("", async (c) => {
  return await userController.create(c);
});

userRouter.put(":id", async (c) => {
  return await userController.update(c);
});

userRouter.delete(":id", async (c) => {
  return await userController.delete(c);
});

export { userRouter };
