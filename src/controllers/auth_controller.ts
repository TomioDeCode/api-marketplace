import { Context } from "hono";
import { authService } from "../services";
import { honoResponse } from "../utils";
import { ServiceError } from "../utils/response";

export const authController = {
  register: async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await authService.register(body);

      return honoResponse.success(c, {
        message:
          "Registration successful! Please check your email for verification",
        user: result.user,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return honoResponse.error(
          c,
          error.message,
          error.statusCode,
          error.errors
        );
      }
      return honoResponse.error(c, "An unexpected error occurred");
    }
  },

  login: async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await authService.login(body);

      return honoResponse.success(c, {
        message: "Login successful! Welcome back",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return honoResponse.error(
          c,
          error.message,
          error.statusCode,
          error.errors
        );
      }
      return honoResponse.error(c, "An unexpected error occurred");
    }
  },

  verifyEmail: async (c: Context) => {
    try {
      const token = c.req.query("token");

      if (!token) {
        return honoResponse.error(c, "Verification token is required", 400);
      }

      const result = await authService.verifyEmail(token);

      return honoResponse.success(c, {
        message: "Email verification successful! You can now login",
        verified: true,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return honoResponse.error(
          c,
          error.message,
          error.statusCode,
          error.errors
        );
      }
      return honoResponse.error(c, "An unexpected error occurred");
    }
  },

  resendVerificationEmail: async (c: Context) => {
    try {
      const body = await c.req.json();
      if (!body.email) {
        return honoResponse.error(c, "Email is required", 400);
      }

      const result = await authService.resendVerificationEmail(body.email);

      return honoResponse.success(c, {
        message: "Verification email has been resent. Please check your inbox",
        email: body.email,
        verificationToken: result.verificationToken,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        return honoResponse.error(
          c,
          error.message,
          error.statusCode,
          error.errors
        );
      }
      return honoResponse.error(c, "An unexpected error occurred");
    }
  },
};
