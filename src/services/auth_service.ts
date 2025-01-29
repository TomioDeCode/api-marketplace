import { prisma } from "../libs/prisma";
import { jwt } from "../utils/jwt";
import { bcrypt } from "../utils/bcrypt";
import { USER_ROLE } from "../constant";
import { TokenPayload } from "../utils/jwt";
import { User, Auth } from "../models";
import { z } from "zod";
import { ServiceError } from "../utils/response";

export const authService = {
  async register(user: Omit<User, "id">) {
    try {
      const validatedData = User.parse(user);

      const verificationToken = crypto.randomUUID();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedData.email },
            { username: validatedData.username },
          ],
        },
      });

      if (existingUser) {
        throw new ServiceError("User already exists", 400);
      }

      const hashedPassword = await bcrypt.hash(validatedData.password);
      const newUser = await prisma.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
          role: USER_ROLE.USER,
          isEmailVerified: false,
          verificationToken,
          tokenExpiry,
        },
      });

      const { password, ...userWithoutPassword } = newUser;
      return { user: userWithoutPassword };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ServiceError("Validation failed", 400, error);
      }
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError("Failed to register user", 500);
    }
  },

  async login(credentials: Auth) {
    try {
      const validatedData = Auth.parse(credentials);

      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (!user) {
        throw new ServiceError("Invalid email or password", 401);
      }

      const isPasswordValid = await bcrypt.compare(
        validatedData.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new ServiceError("Invalid email or password", 401);
      }

      if (!user.isEmailVerified) {
        throw new ServiceError("Please verify your email first", 403);
      }

      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secret", {
        expiresIn: "1d",
      });

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ServiceError("Validation failed", 400, error);
      }
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError("Login failed", 500);
    }
  },

  async verifyEmail(token: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          tokenExpiry: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new ServiceError("Invalid or expired verification token", 400);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null,
          tokenExpiry: null,
        },
      });

      return {
        message: "Email verified successfully",
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError("Failed to verify email", 500);
    }
  },

  async resendVerificationEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new ServiceError("User not found", 404);
      }

      if (user.isEmailVerified) {
        throw new ServiceError("Email is already verified", 400);
      }

      const verificationToken = crypto.randomUUID();
      const tokenExpiry = new Date();
      tokenExpiry.setHours(tokenExpiry.getHours() + 24);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken,
          tokenExpiry,
        },
      });

      return {
        message: "Verification email sent successfully",
        verificationToken,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError("Failed to resend verification email", 500);
    }
  },
};