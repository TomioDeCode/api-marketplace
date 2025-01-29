import { hash, compare } from "bcryptjs";

export const bcrypt = {
  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error("Password is required");
    }
    return await hash(password, 10);
  },

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    if (!password || !hashedPassword) {
      throw new Error("Password and hashed password are required");
    }
    return await compare(password, hashedPassword);
  },
};
