import { ServiceError, bcrypt } from "../utils";
import { User } from "../models";
import { prisma } from "../libs";
import { z } from "zod";
import { USER_ROLE } from "../constant";

export const userService = {
  async index(page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      const whereCondition = search?.trim()
        ? {
            OR: [
              {
                username: search.trim(),
              },
              {
                email: search.trim(),
              },
            ],
          }
        : {};

      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take: limit,
          where: whereCondition,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.user.count({
          where: whereCondition,
        }),
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new ServiceError("Failed to fetch users", 500);
      ``;
    }
  },

  async list() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isEmailVerified: true,
        },
        orderBy: { createdAt: "asc" },
      });

      if (!users || users.length === 0) {
        throw new ServiceError("No users found", 404);
      }

      return users;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      console.error("Error in userService.list:", error);
      throw new ServiceError("Failed to fetch list users", 500);
    }
  },

  async show(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new ServiceError(`No users found with ID: ${id}`, 404);
      }

      return user;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      console.error("Error in userService.list:", error);
      throw new ServiceError("Failed to fetch list users", 500);
    }
  },

  async create(userData: Omit<User, "id">) {
    try {
      const validatedData = User.parse(userData);

      const hashedPassword = await bcrypt.hash(validatedData.password);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedData.email },
            { username: validatedData.username },
          ],
        },
      });

      if (existingUser) {
        throw new ServiceError(
          "User with this email or username already exists",
          409
        );
      }

      const createUser = await prisma.user.create({
        data: {
          email: validatedData.email,
          username: validatedData.username,
          password: hashedPassword,
          role: USER_ROLE.USER,
        },
      });

      const { password, ...userWithoutPassword } = createUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        throw new ServiceError("Invalid user data", 400);
      }

      console.error("Error in userService.create:", error);
      throw new ServiceError("Failed to create user", 500);
    }
  },

  async update(id: string, users: Omit<User, "id">) {
    try {
      const validatedData = User.parse(users);

      const findById = await prisma.user.findUnique({
        where: { id },
      });

      if (!findById) {
        throw new ServiceError(`No users found with ID: ${id}`, 404);
      }

      if (validatedData.password) {
        await bcrypt.hash(validatedData.password);
      }

      const updateUser = await prisma.user.update({
        where: { id },
        data: {
          ...validatedData,
        },
      });

      return updateUser;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      console.error("Error in userService.update:", error);
      throw new ServiceError("Failed to update user", 500);
    }
  },

  async delete(id: string) {
    try {
      const findById = await prisma.user.findUnique({
        where: { id },
      });

      if (!findById) {
        throw new ServiceError(`No users found with ID: ${id}`, 404);
      }

      const deleteUser = await prisma.user.delete({
        where: { id },
      });

      return deleteUser;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }

      console.error("Error in userService.delete:", error);
      throw new ServiceError("Failed to Delete user", 500);
    }
  },
};
