import { Context } from "hono";
import { honoResponse } from "../utils";
import { ServiceError } from "../utils";
import { userService } from "../services";
import { User } from "../models";

export const userController = {
  async index(c: Context) {
    try {
      const page = Math.max(1, Number(c.req.query("page")) || 1);
      const limit = Math.max(
        1,
        Math.min(100, Number(c.req.query("limit")) || 10)
      );
      const search = c.req.query("search")?.trim() || "";

      const result = await userService.index(page, limit, search);

      return honoResponse.paginate(
        c,
        result.users,
        result.total,
        result.page,
        "User retrieved successfully",
        result.limit
      );
    } catch (error) {
      console.error("Error in userController.index:", error);

      if (error instanceof ServiceError) {
        return honoResponse.error(c, error.message, error.statusCode);
      }

      return honoResponse.error(c, "An unexpected error occurred", 500);
    }
  },

  async list(c: Context) {
    try {
      const users = await userService.list();

      return honoResponse.success(
        c,
        users,
        200,
        "User list retrieved successfully"
      );
    } catch (error) {
      console.error("Error in userController.list:", error);

      if (error instanceof ServiceError) {
        return honoResponse.error(c, error.message, error.statusCode);
      }

      return honoResponse.error(c, "An unexpected error occurred", 500);
    }
  },

  async show(c: Context) {
    try {
      const id = c.req.param("id");

      const user = await userService.show(id);

      return honoResponse.success(c, user, 200, "User retrieved successfully");
    } catch (error) {
      console.error("Error in userController.list:", error);

      if (error instanceof ServiceError) {
        return honoResponse.error(c, error.message, error.statusCode);
      }

      return honoResponse.error(c, "An unexpected error occurred", 500);
    }
  },

  async create(c: Context) {
    try {
      const body = await c.req.json();

      const user = await userService.create(body);

      return honoResponse.success(c, user, 201, "User created successfully");
    } catch (error) {
      console.error("Error in userController.create:", error);

      if (error instanceof ServiceError) {
        return honoResponse.error(c, error.message, error.statusCode);
      }

      return honoResponse.error(c, "Internal server error", 500);
    }
  },

  async update(c: Context) {
    try {
      const id = c.req.param("id");
      const body: User = await c.req.json();

      const user = await userService.update(id, body);

      return honoResponse.success(c, user, 201, "User updated successfully");
    } catch (error) {
      console.error("Error in userController.update:", error);

      if (error instanceof ServiceError) {
        return honoResponse.error(c, error.message, error.statusCode);
      }

      return honoResponse.error(c, "An unexpected error occurred", 500);
    }
  },

  async delete(c: Context) {
    try {
      const id = c.req.param("id");
      
      await userService.delete(id);

      return honoResponse.success(c, null, 200, "User deleted successfully");
    } catch (error) {
      console.error("Error in userController.delte:", error);

      if (error instanceof ServiceError) {
        return honoResponse.error(c, error.message, error.statusCode);
      }

      return honoResponse.error(c, "An unexpected error occurred", 500);
    }
  },
};
