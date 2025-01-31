import { prisma } from "../config/database";
import { hashPassword, verifyPassword, generateToken } from "../utils";
import { RegisterRequest, LoginRequest } from "../types";

export class AuthService {
  async register(data: RegisterRequest) {
    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        verificationToken,
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return user;
  }

  async login(data: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await verifyPassword(data.password, user.password))) {
      throw new Error("Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new Error("Email not verified");
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    return { user, token };
  }
}
