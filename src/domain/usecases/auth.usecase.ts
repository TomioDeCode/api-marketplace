import { compareSync, hashSync } from "bcrypt";
import { TokenUtil } from "../../utils/token";
import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";

export class AuthUseCase {
  private tokenUtil: TokenUtil;

  constructor(private userRepository: UserRepository) {
    this.tokenUtil = TokenUtil.getInstance();
  }

  async register(userData: User): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = hashSync(userData.password, 10);
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return user;
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = compareSync(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = await this.tokenUtil.createToken({
      id: user.id,
      email: user.email,
    });

    return { token };
  }

  async verifyToken(token: string) {
    try {
      return await this.tokenUtil.verifyToken(token);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
