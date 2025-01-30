import { Context } from "hono";
import { authService } from "../services";
import { honoResponse, ServiceError } from "../utils";

export const authController = {
  register: async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await authService.register(body);

      return honoResponse.success(
        c,
        {
          user: result.user,
        },
        201,
        "Registration successful! Please check your email for verification"
      );
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

      return honoResponse.success(
        c,
        {
          user: result.user,
          token: result.token,
        },
        200,
        "Login successful! Welcome back"
      );
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

      await authService.verifyEmail(token);

      return honoResponse.success(
        c,
        {
          verified: true,
        },
        200,
        "Email verification successful! You can now login"
      );
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

      return honoResponse.success(
        c,
        {
          email: body.email,
          verificationToken: result.verificationToken,
        },
        200,
        "Verification email has been resent. Please check your inbox"
      );
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
